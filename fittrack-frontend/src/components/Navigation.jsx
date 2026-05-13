import React from 'react';
import { NavLink, Stack, Text, Divider, Group, Badge } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
    { label: '🏠  Dashboard', path: '/' },
    { label: '🔥  Log Activity', path: '/log-activity' },
    { label: '📈  Progress ', path: '/progress' },
    { label: '🗺  Personalized Roadmap', path: '/roadmap' },
];

const Navigation = ({ onNavItemClick }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Stack gap={4} mt="sm" style={{ height: '100%' }}>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" px={12} mb={4}>Menu</Text>
            {NAV_ITEMS.map((item) => (
                <NavLink
                    key={item.path}
                    label={item.label}
                    active={location.pathname === item.path}
                    onClick={() => {
                        navigate(item.path);
                        if (onNavItemClick) onNavItemClick();
                    }}
                    variant="filled"
                    color="violet"
                    style={{ borderRadius: '10px' }}
                />
            ))}

            <Divider my="md" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

            <Text size="xs" fw={700} c="dimmed" tt="uppercase" px={12} mb={4}>System Status</Text>
            <Group px={12} mb="xs">
                <Badge
                    variant="dot"
                    color="teal"
                    size="sm"
                    styles={{ label: { textTransform: 'none', fontWeight: 500 } }}
                >
                    AI Engine Online
                </Badge>
            </Group>

            <div style={{ padding: '0 12px', marginTop: 'auto', marginBottom: '20px' }}>
                <Text size="10px" c="dimmed" style={{ lineHeight: 1.4 }}>
                    🤖 Powered by Gemini 2.5 Flash. AI can make mistakes. Verify important info.
                </Text>
            </div>
        </Stack>
    );
};

export default Navigation;
