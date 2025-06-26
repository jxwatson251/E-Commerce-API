import { Request, Response } from 'express';
import Product from '../models/Product';
import axios from 'axios';

interface ExchangeRateResponse {
  rates: { [key: string]: number };
  base: string;
}

export const getProductPriceInCurrency = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, currency } = req.params;
    const targetCurrency = currency.toUpperCase();

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (!/^[A-Z]{3}$/.test(targetCurrency)) {
      res.status(400).json({ message: 'Invalid currency code. Must be 3 letters (e.g., EUR, GBP)' });
      return;
    }

    if (targetCurrency === 'USD') {
      res.json({
        productId: product._id,
        productName: product.name,
        originalPrice: product.price,
        currency: 'USD',
        convertedPrice: product.price,
        exchangeRate: 1
      });
      return;
    }

    const exchangeApiUrl = process.env.EXCHANGE_API_URL || 'https://api.exchangerate-api.com/v4/latest/USD';
    const response = await axios.get<ExchangeRateResponse>(exchangeApiUrl);
    
    const exchangeRate = response.data.rates[targetCurrency];
    if (!exchangeRate) {
      res.status(400).json({ message: `Currency ${targetCurrency} not supported` });
      return;
    }

    const convertedPrice = Math.round((product.price * exchangeRate) * 100) / 100; // Round to 2 decimal places

    res.json({
      productId: product._id,
      productName: product.name,
      originalPrice: product.price,
      currency: targetCurrency,
      convertedPrice,
      exchangeRate
    });

  } catch (error: any) {
    console.error('Currency conversion error:', error);
    if (error.response) {
      res.status(503).json({ message: 'Currency conversion service unavailable' });
    } else if (error.request) {
      res.status(503).json({ message: 'Unable to reach currency conversion service' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}