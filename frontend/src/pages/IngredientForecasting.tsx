import React, { useState, useEffect } from 'react';

interface Ingredient {
    id?: number;
    name: string;
    unit: string;
    stockQuantity: number;
    quantityPerGuest: number;
}

export const IngredientForecasting: React.FC = () => {
    // CRUD States
    const [ingredients, setIngredients] = useState<Ingredient[]>([
        { id: 1, name: "Basmati Rice", unit: "kg", stockQuantity: 25.0, quantityPerGuest: 0.15 },
        { id: 2, name: "Fresh Chicken", unit: "kg", stockQuantity: 15.0, quantityPerGuest: 0.20 },
        { id: 3, name: "Mixed Vegetables", unit: "kg", stockQuantity: 30.0, quantityPerGuest: 0.10 }
    ]);
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('kg');
    const [stockQuantity, setStockQuantity] = useState<number>(10);
    const [quantityPerGuest, setQuantityPerGuest] = useState<number>(0.1);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Forecasting States
    const [guestCount, setGuestCount] = useState<number>(100);
    const [forecastResults, setForecastResults] = useState<Record<string, number> | null>(null);

    // Fetch ingredients from backend on load
    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            const res = await fetch('/api/ingredients');
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    setIngredients(data);
                }
            }
        } catch {
            console.log("Using local state fallback for ingredients");
        }
    };

    // CREATE or UPDATE Ingredient
    const handleSaveIngredient = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: Ingredient = { name, unit, stockQuantity, quantityPerGuest };

        if (editingId) {
            // UPDATE
            try {
                const res = await fetch(`/api/ingredients/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    fetchIngredients();
                }
            } catch {
                // Local state fallback
                setIngredients(prev => prev.map(item => item.id === editingId ? { ...payload, id: editingId } : item));
            }
            setEditingId(null);
        } else {
            // CREATE
            try {
                const res = await fetch('/api/ingredients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    fetchIngredients();
                }
            } catch {
                // Local state fallback
                const newId = Date.now();
                setIngredients(prev => [...prev, { ...payload, id: newId }]);
            }
        }

        // Reset form
        setName('');
        setUnit('kg');
        setStockQuantity(10);
        setQuantityPerGuest(0.1);
    };

    // START EDITING
    const handleEdit = (item: Ingredient) => {
        setEditingId(item.id || null);
        setName(item.name);
        setUnit(item.unit);
        setStockQuantity(item.stockQuantity);
        setQuantityPerGuest(item.quantityPerGuest);
    };

    // DELETE Ingredient
    const handleDelete = async (id?: number) => {
        if (!id) return;
        try {
            const res = await fetch(`/api/ingredients/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchIngredients();
            }
        } catch {
            // Local state fallback
            setIngredients(prev => prev.filter(item => item.id !== id));
        }
        setIngredients(prev => prev.filter(item => item.id !== id));
    };

    // CALCULATE FORECAST
    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/ingredients/forecast?guestCount=${guestCount}`);
            if (response.ok) {
                const data = await response.json();
                setForecastResults(data);
            } else {
                // Local calculation fallback
                calculateLocalForecast();
            }
        } catch {
            calculateLocalForecast();
        }
    };

    const calculateLocalForecast = () => {
        const results: Record<string, number> = {};
        ingredients.forEach(item => {
            results[`${item.name} (${item.unit})`] = parseFloat((guestCount * item.quantityPerGuest).toFixed(2));
        });
        setForecastResults(results);
    };

    return (
        <div style={{ padding: '30px', maxWidth: '850px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ borderBottom: '2px solid #203e36', paddingBottom: '10px' }}>
                🌿 Ingredient Inventory & Forecasting (PBI-10)
            </h2>

            {/* SECTION 1: CRUD OPERATIONS */}
            <div style={{ background: '#fffdf8', border: '1px solid #dce0d5', padding: '24px', borderRadius: '8px', marginBottom: '30px' }}>
                <h3>{editingId ? "✏️ Edit Ingredient" : "➕ Add New Ingredient (Create)"}</h3>
                <form onSubmit={handleSaveIngredient} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end', marginBottom: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Basmati Rice"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Unit</label>
                        <select value={unit} onChange={e => setUnit(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                            <option value="kg">kg</option>
                            <option value="grams">grams</option>
                            <option value="liters">liters</option>
                            <option value="pcs">pcs</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Stock</label>
                        <input
                            type="number"
                            step="0.1"
                            value={stockQuantity}
                            onChange={e => setStockQuantity(parseFloat(e.target.value) || 0)}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Per Guest</label>
                        <input
                            type="number"
                            step="0.01"
                            value={quantityPerGuest}
                            onChange={e => setQuantityPerGuest(parseFloat(e.target.value) || 0)}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                    <div>
                        <button type="submit" style={{ padding: '9px 16px', background: '#203e36', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {editingId ? "Update" : "Add"}
                        </button>
                    </div>
                </form>

                {/* INGREDIENTS TABLE (READ, UPDATE, DELETE) */}
                <h4>Current Ingredients in Inventory (Read):</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '10px' }}>
                    <thead>
                        <tr style={{ background: '#eef0e7', borderBottom: '2px solid #ccc' }}>
                            <th style={{ padding: '8px' }}>Name</th>
                            <th style={{ padding: '8px' }}>Unit</th>
                            <th style={{ padding: '8px' }}>Stock Quantity</th>
                            <th style={{ padding: '8px' }}>Per Guest</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ingredients.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #e2e5db' }}>
                                <td style={{ padding: '8px' }}><strong>{item.name}</strong></td>
                                <td style={{ padding: '8px' }}>{item.unit}</td>
                                <td style={{ padding: '8px' }}>{item.stockQuantity} {item.unit}</td>
                                <td style={{ padding: '8px' }}>{item.quantityPerGuest} {item.unit}</td>
                                <td style={{ padding: '8px', textAlign: 'center' }}>
                                    <button
                                        onClick={() => handleEdit(item)}
                                        style={{ marginRight: '8px', padding: '4px 10px', background: '#bb742f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        style={{ padding: '4px 10px', background: '#913d2e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* SECTION 2: FORECASTING CALCULATION */}
            <div style={{ background: '#fffdf8', border: '1px solid #dce0d5', padding: '24px', borderRadius: '8px' }}>
                <h3>📊 Guest Forecast Calculator</h3>
                <form onSubmit={handleCalculate} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                    <label style={{ fontWeight: 'bold' }}>Number of Guests:</label>
                    <input
                        type="number"
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        min="1"
                        style={{ width: '120px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                    <button type="submit" style={{ padding: '9px 18px', background: '#203e36', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Calculate Forecast
                    </button>
                </form>

                {forecastResults && (
                    <div>
                        <h4>Required Ingredients for {guestCount} Guests:</h4>
                        <ul style={{ background: '#f7f5ee', padding: '16px 30px', borderRadius: '6px' }}>
                            {Object.entries(forecastResults).map(([ingredient, amount]) => (
                                <li key={ingredient} style={{ margin: '8px 0' }}>
                                    <strong>{ingredient}:</strong> {amount}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IngredientForecasting;