import os
from flask import Flask, render_template, request, jsonify, redirect, url_for
import stripe
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Set your Stripe secret key (read from .env file)
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# Define the route for the homepage, which will render the payment form
@app.route('/')
def index():
    return render_template('index.html')


# Endpoint to create a payment intent and return the client secret
@app.route('/create-payment-intent', methods=['POST'])
def create_payment_intent():
    try:
        # Get the amount from the request (in cents)
        amount = int(request.json.get('amount'))  # Amount in cents (for example, $50 = 5000)

        # Create a PaymentIntent with the given amount
        intent = stripe.PaymentIntent.create(
            amount=amount,  # Amount in cents
            currency='usd',
            metadata={'integration_check': 'accept_a_payment'}
        )

        # Return the client secret for frontend to use
        return jsonify({
            'clientSecret': intent.client_secret
        })
    except Exception as e:
        return jsonify(error=str(e)), 403


# Route to handle the payment success or failure after redirecting back
@app.route('/payment-success')
def payment_success():
    return render_template('payment-success.html')


@app.route('/payment-failure')
def payment_failure():
    return render_template('payment-failure.html')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=7000)
