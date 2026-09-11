# Plastic Packaging Company Website

Plastic packaging product catalog and ordering platform built with Flask and React.

The application supports:

- Plastic packaging product catalog and specifications
- Product categories, search, and filtering
- Customer registration, login, profiles, and order history
- Buy-now ordering with VNPay and COD flows
- Product reviews
- Admin/staff product, category, customer, and order management
- News, support, and company contact surfaces

The application-facing domain uses `Product`, `ProductCategory`, `Customer`,
`Admin/Staff`, `Order`, `Payment`, and `Review`. Historical database and
migration names are retained only where changing them would risk existing data.