import React, { useState, useEffect } from 'react';
import { Stack, Group, Title, Text, ActionIcon, Progress, Tooltip, Alert } from '@mantine/core';
import { IconDroplet, IconPlus, IconMinus, IconAlertCircle } from '@tabler/icons-react';
import api from '../api';

const WaterTracker = () => {
    const [amount, setAmount] = useState(0);
    const [goal] = useState(2500); // 2.5L goal
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchWater();
    }, []);

    const fetchWater = async () => {
        try {
            const res = await api.get('/water/today');
            setAmount(res.data.amount_ml || 0);
        } catch (err) {
            console.error('Failed to fetch water logs', err);
        }
    };

    const updateWater = async (diff) => {
        const newAmount = Math.max(0, amount + diff);
        setLoading(true);
        try {
            await api.post('/water/add', { amount: diff });
            setAmount(newAmount);
        } catch (err) {
            console.error('Failed to update water', err);
        } finally {
            setLoading(false);
        }
    };

    const percentage = Math.min(100, (amount / goal) * 100);
    const isDehydrated = amount < goal * 0.5; // Warning if less than 50% of goal

    return (
        <div className="glass-card">
            <Stack gap="md">
                <Group justify="space-between">
                    <Group gap="xs">
                        <IconDroplet color="#339af0" fill="#339af0" size={24} />
                        <Title order={4}>Water Intake</Title>
                    </Group>
                    <Text size="sm" fw={700} c={isDehydrated ? 'orange' : 'cyan'}>
                        {amount} / {goal} ml
                    </Text>
                </Group>

                <Tooltip label={`${Math.round(percentage)}% of daily goal`}>
                    <Progress 
                        value={percentage} 
                        size="xl" 
                        radius="xl" 
                        color="cyan" 
                        striped 
                        animated={loading}
                    />
                </Tooltip>

                <Group justify="center" gap="xl">
                    <ActionIcon 
                        variant="light" 
                        color="gray" 
                        size="lg" 
                        radius="xl" 
                        onClick={() => updateWater(-250)}
                        disabled={amount <= 0 || loading}
                    >
                        <IconMinus size={18} />
                    </ActionIcon>
                    
                    <Stack gap={0} align="center">
                        <Text size="xs" c="dimmed">Add Glass</Text>
                        <Text size="sm" fw={700}>(250ml)</Text>
                    </Stack>

                    <ActionIcon 
                        variant="light" 
                        color="cyan" 
                        size="lg" 
                        radius="xl" 
                        onClick={() => updateWater(250)}
                        loading={loading}
                    >
                        <IconPlus size={18} />
                    </ActionIcon>
                </Group>

                {isDehydrated && (
                    <Alert color="orange" variant="light" icon={<IconAlertCircle size={16} />}>
                        <Text size="xs">You're below 50% of your hydration goal. Drink up!</Text>
                    </Alert>
                )}
            </Stack>
        </div>
    );
};

export default WaterTracker;
