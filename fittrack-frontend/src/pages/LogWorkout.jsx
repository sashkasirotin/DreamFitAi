import React, { useState, useEffect } from 'react';
import { Title, Text, Table, Badge, Group, Button, Stack, TextInput, NumberInput, Select, Textarea } from '@mantine/core';
import api from '../api';

const WORKOUT_TYPES = [
    { value: 'Strength', label: '💪 Strength Training' },
    { value: 'Cardio', label: '🏃 Cardio' },
    { value: 'HIIT', label: '⚡ HIIT' },
    { value: 'Yoga', label: '🧘 Yoga / Flexibility' },
    { value: 'Sports', label: '⚽ Sports' },
    { value: 'Other', label: '🏋️ Other' },
];

const LogWorkout = () => {
    const [workouts, setWorkouts] = useState([]);
    const [type, setType] = useState('Strength');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(30);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchWorkouts();
    }, []);

    const fetchWorkouts = async () => {
        try {
            const res = await api.get('/workouts');
            setWorkouts(res.data);
        } catch (err) {
            setError('Failed to load workouts.');
        }
    };

    const handleLog = async () => {
        if (!description || !duration) return;
        setLoading(true);
        setError('');
        try {
            await api.post('/workouts', {
                description: `${type}: ${description}`,
                duration_minutes: duration,
            });
            setDescription('');
            setDuration(30);
            fetchWorkouts();
        } catch (err) {
            setError('Failed to log workout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack gap="xl">
            <div>
                <Title order={2} mb="md">Log a Workout</Title>
                <div className="glass-card">
                    <Stack gap="md">
                        <Group grow>
                            <Select
                                label="Workout Type"
                                data={WORKOUT_TYPES}
                                value={type}
                                onChange={setType}
                            />
                            <NumberInput
                                label="Duration (minutes)"
                                placeholder="30"
                                value={duration}
                                onChange={setDuration}
                                min={1}
                                max={300}
                            />
                        </Group>
                        <Textarea
                            label="Notes / Description"
                            placeholder="e.g. Bench press 3x10, squats 4x8..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            minRows={2}
                        />
                        {error && <Text c="red" size="sm">{error}</Text>}
                        <Button
                            color="violet"
                            onClick={handleLog}
                            loading={loading}
                            disabled={!description || !duration}
                        >
                            Log Workout
                        </Button>
                    </Stack>
                </div>
            </div>

            <div>
                <Title order={2} mb="md">Workout History</Title>
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    {workouts.length === 0 ? (
                        <Text c="dimmed" size="sm" p="xl">No workouts logged yet. Log your first workout above!</Text>
                    ) : (
                        <Table verticalSpacing="md" highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Workout</Table.Th>
                                    <Table.Th>Duration</Table.Th>
                                    <Table.Th>Date</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {workouts.map((w) => (
                                    <Table.Tr key={w.id}>
                                        <Table.Td fw={500}>{w.description}</Table.Td>
                                        <Table.Td>
                                            <Badge color="violet" variant="light">{w.duration_minutes} min</Badge>
                                        </Table.Td>
                                        <Table.Td c="dimmed" size="sm">
                                            {new Date(w.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    )}
                </div>
            </div>
        </Stack>
    );
};

export default LogWorkout;
