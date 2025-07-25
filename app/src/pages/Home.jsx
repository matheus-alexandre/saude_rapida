import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';

export const PageHome = () => {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box textAlign="center" mb={4}>
                <Typography variant="h1" color="primary" gutterBottom>
                    Saúde Rápida
                </Typography>
                <Typography variant="h5" color="textSecondary">
                    Sua plataforma de saúde digital
                </Typography>
            </Box>
            
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h4" gutterBottom>
                        Bem-vindo!
                    </Typography>
                    <Typography variant="body1">
                        Esta é a aplicação Saúde Rápida. A aplicação está funcionando corretamente.
                    </Typography>
                </CardContent>
            </Card>
        </Container>
    );
};
