import React, { useState } from 'react';

export const IngredientForecasting: React.FC = () => {
    const [guestCount, setGuestCount] = useState<number>(100);
    const [forecastResults, setForecastResults] = useState<Record<string, number> | null>(null);

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/ingredients/forecast?guestCount=${guestCount}`);
            if (response.ok) {
                const data = await response.json();
                setForecastResults(data);
            } else {
                console.error("Failed to fetch forecast");
            }
        } catch (error) {
            console.error("Error connecting to backend API:", error);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Ingredient Forecasting (PBI-10)</h2>
            <form onSubmit={handleCalculate} style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                    Number of Guests:
                </label>
                <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    min="1"
                    style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
                />
                <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    Calculate Forecast
                </button>
            </form>

            {forecastResults && (
                <div>
                    <h3>Required Ingredients:</h3>
                    <ul>
                        {Object.entries(forecastResults).map(([ingredient, amount]) => (
                            <li key={ingredient}>
                                <strong>{ingredient}:</strong> {amount}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default IngredientForecasting;