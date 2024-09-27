import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import cors from 'cors';
import axios from 'axios';
import multer from 'multer';
import fs from 'fs/promises';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { marked } from 'marked';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAioidH1IyJJPtQpLrbAzllvZ-BQbgJ0xQ",
  authDomain: "tax-genie-f1840.firebaseapp.com",
  projectId: "tax-genie-f1840",
  storageBucket: "tax-genie-f1840.appspot.com",
  messagingSenderId: "370816786830",
  appId: "1:370816786830:web:c17d7ccdf713f6406f84df",
  measurementId: "G-J6YZ72F1FC"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Set up multer for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files from 'public' directory
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

let pdfContent = ''; // Variable to store the parsed PDF content

// Function to get bot response from Gemini LLM
const getResponseFromGemini = async (userMessage) => {
  try {
    const context = "You are a helpful AI assistant. Please provide informative and engaging responses on any topic. If a PDF has been uploaded, use its content to inform your answers when relevant.";
    const fullMessage = `${context}\n\nPDF Content:\n${pdfContent}\n\nUser: ${userMessage}\n\nAssistant: Based on the context and the PDF content (if available), here's my response:`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: fullMessage
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }
    );

    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      const botReply = response.data.candidates[0].content.parts[0].text;

      // Convert to HTML using marked
      const markdownReply = marked(botReply);

      // Use jsdom to create a window for DOMPurify to work
      const window = new JSDOM('').window;
      const DOMPurify = createDOMPurify(window);

      // Sanitize the HTML
      const cleanHTML = DOMPurify.sanitize(markdownReply);

      return cleanHTML;
    } else {
      console.error('Unexpected response structure:', response.data);
      return 'I apologize, but I received an unexpected response structure. Could you please try asking your question again?';
    }
  } catch (error) {
    console.error('Error fetching response from Gemini LLM:', error.response ? error.response.data : error.message);
    return 'I apologize, but I\'m having trouble responding right now. Could you please try again in a moment?';
  }
};

// API route to handle PDF uploads
app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  try {
    const dataBuffer = await fs.readFile(req.file.path);
    const data = await pdfParse(dataBuffer);
    pdfContent = data.text;

    // Clean up the uploaded file
    await fs.unlink(req.file.path);

    res.status(200).json({ message: 'PDF uploaded and processed successfully' });
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Error processing PDF' });
  }
});

// API route to handle chat messages
app.post('/chat/:chatId', async (req, res) => {
  const chatId = req.params.chatId;
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message content is missing' });
  }

  try {
    // Save user message to Firestore
    await addDoc(collection(db, 'messages'), {
      text: message,
      sender: 'user',
      chatId,
      timestamp: new Date(),
    });

    // Get bot response from Gemini LLM
    const botReply = await getResponseFromGemini(message);

    // Save bot reply to Firestore
    await addDoc(collection(db, 'messages'), {
      text: botReply,
      sender: 'bot',
      chatId,
      timestamp: new Date(),
    });

    res.status(200).json({ reply: botReply });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});


// API route to retrieve chat messages
app.get('/chat/:chatId', async (req, res) => {
  const chatId = req.params.chatId;

  try {
    // Fetch messages for the chatId
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId)
    );
    const messagesSnapshot = await getDocs(messagesQuery);

    if (messagesSnapshot.empty) {
      return res.status(200).json({ messages: [] });
    }

    const messages = messagesSnapshot.docs.map(doc => ({
      text: doc.data().text,
      sender: doc.data().sender,
    }));

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Serve 'index.html' for the root path ('/')
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Serve 'chat.html' for any '/chat/*' routes
app.get('/chat?*', (req, res) => {
  res.sendFile(path.join(publicPath, 'chat.html'));
});
app.get('/feedback', (req, res) => {
  res.sendFile(path.join(publicPath, 'feedback.html'));
});
// Catch-all route ('*') to serve 'index.html' for any other undefined paths
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
