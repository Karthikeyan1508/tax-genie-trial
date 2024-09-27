// Your Firebase configuration from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyAioidH1IyJJPtQpLrbAzllvZ-BQbgJ0xQ",
    authDomain: "tax-genie-f1840.firebaseapp.com",
    projectId: "tax-genie-f1840",
    storageBucket: "tax-genie-f1840.appspot.com",
    messagingSenderId: "370816786830",
    appId: "1:370816786830:web:c17d7ccdf713f6406f84df",
    measurementId: "G-J6YZ72F1FC"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // if already initialized, use that one
}

// Initialize Firestore
const db = firebase.firestore();

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Reference to the form
    const feedbackForm = document.getElementById('feedbackForm');

    if (feedbackForm) {
        // Listen for form submission
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form responses
            const featureAnswer = document.getElementById('featureAnswer').value;
            const usageAnswer = document.getElementById('usageAnswer').value;
            const motivationAnswer = document.getElementById('motivationAnswer').value;
            const improvementAnswer = document.getElementById('improvementAnswer').value;
            
            // Store data in Firestore
            db.collection('feedback').add({
                featureAnswer: featureAnswer,
                usageAnswer: usageAnswer,
                motivationAnswer: motivationAnswer,
                improvementAnswer: improvementAnswer,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                // Alert the user about successful submission
                alert('Feedback submitted successfully!');
                
                // Redirect to index.html after the alert
                window.location.href = '/';
            })
            .catch((error) => {
                console.error('Error adding document: ', error);
                alert('An error occurred while submitting feedback. Please try again.');
            });
        });
    } else {
        console.error('Feedback form not found in the DOM');
    }
});