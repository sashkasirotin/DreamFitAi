import React, { useState, useEffect } from 'react';
import { Title, Text, Table, Badge, Group, Button, Stack, TextInput, NumberInput, FileInput, Loader, Alert } from '@mantine/core';
import { IconPhoto, IconSparkles } from '@tabler/icons-react';
import api from '../api';

const LogMeal = () => {
    const [meals, setMeals] = useState([]);
    const [name, setName] = useState('');
    const [calories, setCalories] = useState(0);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMeals();
    }, []);

    const fetchMeals = async () => {
        try {
            const response = await api.get('/meals');
            setMeals(response.data);
        } catch (err) {
            console.error('Error fetching meals:', err);
        }
    };

    const handleLogMeal = async () => {
        if (!name || !calories) return;
        try {
            setError('');
            const formData = new FormData();
            formData.append('description', name);
            // Ensure calories is an integer for the backend
            formData.append('calories', Math.round(calories));
            if (image) {
                formData.append('image', image);
            }

            await api.post('/meals', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setName('');
            setCalories(0);
            setImage(null);
            fetchMeals();
        } catch (err) {
            console.error('Error logging meal:', err);
            setError(err.response?.data?.error || 'Failed to save meal. Check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeAI = async () => {
        setAnalyzing(true);
        try {
            let base64Image = null;
            if (image) {
                const reader = new FileReader();
                base64Image = await new Promise((resolve) => {
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.readAsDataURL(image);
                });
            }

            const response = await api.post('/meals/analyze', {
                description: name,
                image: base64Image
            });

            if (response.data) {
                setName(response.data.description);
                setCalories(response.data.calories);
            }
        } catch (err) {
            console.error('AI Analysis error:', err);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <Stack spacing="xl">
            <div>
                <Title order={2} mb="md">Log a New Meal</Title>
                <div className="glass-card">
                    <Stack>
                        {error && <Alert color="red" mb="md">{error}</Alert>}
                        <Group grow align="flex-end">
                            <TextInput
                                label="Meal Name or Description"
                                placeholder="e.g. Chicken Salad"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <NumberInput
                                label="Calories"
                                placeholder="0"
                                value={calories}
                                onChange={setCalories}
                            />
                        </Group>
                        <Group align="flex-end">
                            <FileInput
                                label="Upload Meal Photo (Optional)"
                                placeholder="Take a picture"
                                leftSection={<IconPhoto size={14} />}
                                value={image}
                                onChange={setImage}
                                accept="image/png,image/jpeg"
                                style={{ flex: 1 }}
                            />
                            <Button
                                color="cyan"
                                variant="light"
                                leftSection={<IconSparkles size={16} />}
                                onClick={handleAnalyzeAI}
                                loading={analyzing}
                                disabled={!name && !image}
                            >
                                AI Analyze
                            </Button>
                            <Button
                                color="violet"
                                onClick={handleLogMeal}
                                loading={loading}
                                disabled={!name || !calories}
                            >
                                Log Meal
                            </Button>
                        </Group>
                    </Stack>
                </div>
            </div>

            <div>
                <Title order={2} mb="md">Today's Meals</Title>
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <Table verticalSpacing="md" highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Photo</Table.Th>
                                <Table.Th>Meal</Table.Th>
                                <Table.Th>Time</Table.Th>
                                <Table.Th>Calories</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {meals.map((meal) => (
                                <Table.Tr key={meal.id}>
                                    <Table.Td>
                                        {meal.image_url ? (
                                            <img src={meal.image_url} alt={meal.description} style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: 40, height: 40, borderRadius: 4, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <IconPhoto size={16} opacity={0.3} />
                                            </div>
                                        )}
                                    </Table.Td>
                                    <Table.Td fw={500}>{meal.description}</Table.Td>
                                    <Table.Td>{new Date(meal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Table.Td>
                                    <Table.Td>
                                        <Badge variant="light" color="cyan">{meal.calories} kcal</Badge>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </div>
            </div>
        </Stack>
    );
};

export default LogMeal;

