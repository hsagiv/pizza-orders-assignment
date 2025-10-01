# SSL Certificates for Development

This directory should contain SSL certificates for HTTPS support in production.

## Development Setup

For development, you can generate self-signed certificates:

```bash
# Generate private key
openssl genrsa -out key.pem 2048

# Generate certificate
openssl req -new -x509 -key key.pem -out cert.pem -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

## Production Setup

For production, use proper SSL certificates from a trusted CA like Let's Encrypt.

## Files Required

- `cert.pem` - SSL certificate
- `key.pem` - SSL private key

## Security Note

Never commit real SSL certificates to version control. Use environment variables or secure secret management in production.
