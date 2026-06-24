// js/contact.js

// Supabase Connection Details
var SUPABASE_URL = 'https://ysdxpzmijxdjcuublxxq.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_WlU14Kmk7hTOMObXRuACBA_HKIOS-rL';

// Initialize Supabase Client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const project = document.getElementById('project').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            // Basic validation
            if (!name || !email || !message) {
                showMessage('Please fill in all required fields (Name, Email, Message).', 'danger');
                return;
            }

            // Change button text to indicate loading
            const submitBtn = contactForm.querySelector('button[type="submit"]') || contactForm.querySelector('button');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            try {
                console.log("Attempting to insert into Supabase...", { name, email, phone, project, subject, message });
                
                // Insert data into Supabase 'contact_submissions' table
                const { data, error } = await supabaseClient
                    .from('contact_submissions')
                    .insert([
                        { 
                            name: name, 
                            email: email, 
                            phone: phone, 
                            project: project, 
                            subject: subject, 
                            message: message 
                        }
                    ]);

                if (error) {
                    console.error("Supabase returned an error object:", error);
                    throw error;
                }

                console.log("Insert successful! Data returned:", data);

                // Success
                showMessage('Thank you! Your message has been sent successfully.', 'success');
                contactForm.reset();
            } catch (error) {
                console.error('Error submitting form catch block:', error);
                const errorDetails = error.message || error.details || JSON.stringify(error);
                alert("Database Error: " + errorDetails); // Hard alert so it's impossible to miss
                showMessage('Oops! Something went wrong: ' + errorDetails, 'danger');
            } finally {
                // Reset button
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    function showMessage(msg, type) {
        if (!formMessage) return;
        
        formMessage.className = `alert alert-${type} mb-3`;
        formMessage.innerText = msg;
        formMessage.classList.remove('d-none');
        
        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.classList.add('d-none');
            formMessage.className = 'd-none';
        }, 5000);
    }
});
