import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, Grid, Box, Typography, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Validation schema with Yup
const schema = yup.object({
  fromCurrency: yup.string().required("From currency is required"),
  toCurrency: yup.string().required("To currency is required"),
  amount: yup.number().positive("Amount must be a positive number").required("Amount is required"),
}).required();

const CurrencySwapForm = ({ apiUrl }) => {
  const [currencies, setCurrencies] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Process API data to extract the latest price for each unique currency
        const latestRates = {};
        data.forEach((item) => {
          const { currency, price, date } = item;
          if (!latestRates[currency] || new Date(latestRates[currency].date) < new Date(date)) {
            latestRates[currency] = { price, date };
          }
        });

        setCurrencies(Object.keys(latestRates));
        setExchangeRates(Object.fromEntries(Object.entries(latestRates).map(([key, value]) => [key, value.price])));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
        setLoading(false);
      }
    };

    fetchRates();
  }, [apiUrl]);

  const onSubmit = (data) => {
    const { fromCurrency, toCurrency, amount } = data;

    // Perform the currency conversion
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    if (fromRate && toRate) {
      const converted = ((amount * toRate) / fromRate).toFixed(6);
      setConvertedAmount({ fromCurrency, toCurrency, amount, result: converted });
    } else {
      setConvertedAmount(null);
    }
  };

  return (
    <Box sx={{ padding: 3, maxWidth: 600, margin: "auto" }}>
      {loading ? (
        <Typography variant="h6">Loading exchange rates...</Typography>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* From Currency Dropdown */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>From Currency</InputLabel>
                <Select
                  label="From Currency"
                  {...register("fromCurrency")}
                  error={!!errors.fromCurrency}
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency} value={currency}>
                      {currency}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {errors.fromCurrency && <Typography color="error">{errors.fromCurrency.message}</Typography>}
            </Grid>

            {/* To Currency Dropdown */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>To Currency</InputLabel>
                <Select
                  label="To Currency"
                  {...register("toCurrency")}
                  error={!!errors.toCurrency}
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency} value={currency}>
                      {currency}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {errors.toCurrency && <Typography color="error">{errors.toCurrency.message}</Typography>}
            </Grid>

            {/* Amount Input */}
            <Grid item xs={12}>
              <TextField
                {...register("amount")}
                label="Amount"
                fullWidth
                error={!!errors.amount}
                helperText={errors.amount?.message}
                type="number"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" fullWidth>
                Swap
              </Button>
            </Grid>
          </Grid>
        </form>
      )}

      {/* Display converted amount */}
      {convertedAmount && (
        <Box sx={{ marginTop: 3 }}>
          <Typography variant="h6">
            {convertedAmount.amount} {convertedAmount.fromCurrency} = {convertedAmount.result} {convertedAmount.toCurrency}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CurrencySwapForm;
