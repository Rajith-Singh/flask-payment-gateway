// Initialize Stripe and Elements
const stripe = Stripe('pk_test_51QSBicFt4im41SMV1oZ75sleqtJLqzvyB8iCVHITAUFYMCDkPCVkwyRVAW0UqwKKqzJcjoPE07DFrjT3rw04i5aP00WCSOQQ78'); // Replace with your actual public key
const elements = stripe.elements();

// Get the form and submit button
const form = document.getElementById('payment-form');
const submitButton = document.getElementById('submit');
const amountDisplay = document.getElementById('amount-display');

// Fetch the amount from the backend via an API call (in cents)
const urlParams = new URLSearchParams(window.location.search);
const amount = parseInt(urlParams.get('amount'));  // Amount in cents (e.g., $50 = 5000 cents)
amountDisplay.innerText = (amount / 100).toFixed(2);  // Display the amount in dollars

// Create an instance of the card element
const card = elements.create('card');
card.mount('#card-element');

// Handle form submission
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Disable the submit button to prevent multiple clicks
    submitButton.disabled = true;

    // Get the cardholder's name
    const cardholderName = document.getElementById('card-holder-name').value;

    // Send the request to the backend to create a PaymentIntent
    const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            amount: amount,
            payment_method: card.id,  // Pass the card ID here
        }),
    });

    const { clientSecret, error } = await response.json();

    if (error) {
        // Handle error (e.g., display it on the form)
        document.getElementById('card-errors').textContent = error.message;
        submitButton.disabled = false;
        return;
    }

    // Confirm the payment with the card details and client secret
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
            card: card,
            billing_details: {
                name: cardholderName,
            },
        },
    });

    if (stripeError) {
        // Display Stripe error (e.g., invalid card)
        document.getElementById('card-errors').textContent = stripeError.message;
        submitButton.disabled = false;
    } else if (paymentIntent.status === 'succeeded') {
        // Payment was successful
        window.location.href = '/payment-success';  // Redirect to success page
    } else {
        // Payment failed
        window.location.href = '/payment-failure';  // Redirect to failure page
    }
});