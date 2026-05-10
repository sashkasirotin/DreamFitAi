import React from 'react';
import { Title, Text, Grid, Group, Stack, Badge, ThemeIcon } from '@mantine/core';

const Dashboard = () => {
    return (
        <div>
            <div className="dashboard-hero">
                <img src="/hero.png" alt="Fitness Dashboard Graphic" />
                <div className="dashboard-hero-content">
                    <Badge color="violet" size="lg" mb="sm" variant="dot">Welcome Back</Badge>
                    <Title order={1} style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                        Ready to <span className="gradient-text">Crush It?</span>
                    </Title>
                    <Text size="lg" color="dimmed" style={{ maxWidth: '400px' }}>
                        Track your meals, dominate your workouts, and unlock AI-powered insights to hit your goals faster.
                    </Text>
                </div>
            </div>

            <Grid>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <div className="glass-card">
                        <Group justify="space-between" mb="xs">
                            <Text fw={600} c="dimmed">DAILY CALORIES</Text>
                            <Badge color="cyan" variant="light">1,450 kcal</Badge>
                        </Group>
                        <Title order={2} ta="center" mt="md" mb="md" size="h1" className="gradient-text">2,100</Title>
                        <Text size="sm" ta="center" c="dimmed">Goal for today</Text>
                    </div>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <div className="glass-card">
                        <Group justify="space-between" mb="xs">
                            <Text fw={600} c="dimmed">ACTIVE WORKOUTS</Text>
                            <Badge color="violet" variant="light">4 sessions</Badge>
                        </Group>
                        <Title order={2} ta="center" mt="md" mb="md" size="h1" style={{ color: '#fff' }}>2.5 hrs</Title>
                        <Text size="sm" ta="center" c="dimmed">Total time this week</Text>
                    </div>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <div className="glass-card">
                        <Group justify="space-between" mb="xs">
                            <Text fw={600} c="dimmed">AI INSIGHT</Text>
                            <Badge color="pink" variant="light">New</Badge>
                        </Group>
                        <Text size="sm" mt="md" style={{ lineHeight: 1.6 }}>
                            "You've been hitting high-intensity workouts! Make sure to up your protein intake today to ensure complete muscle recovery."
                        </Text>
                        <Text size="xs" ta="right" mt="sm" c="dimmed">— Claude 3.5 Sonnet</Text>
                    </div>
                </Grid.Col>
            </Grid>
        </div>
    );
};

export default Dashboard;
