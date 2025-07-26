import React from 'react';
import { Container, Typography, Box, Card, CardContent, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export const PageHome = () => {
    const navigate = useNavigate();

    const handleTriageClick = () => {
        navigate('/triage');
    };

    const handleAdminClick = () => {
        navigate('/admin');
    };

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
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" gutterBottom textAlign="center" mb={4}>
                        Bem-vindo!
                    </Typography>
                    
                    <Grid container spacing={3} justifyContent="center">
                        <Grid item xs={12} md={6}>
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                onClick={handleTriageClick}
                                startIcon={<LocalHospitalIcon />}
                                sx={{
                                    py: 3,
                                    fontSize: '1.2rem',
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    boxShadow: 3,
                                    '&:hover': {
                                        boxShadow: 6,
                                        transform: 'translateY(-2px)',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                Ir Para a Triagem
                            </Button>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Button
                                variant="outlined"
                                size="large"
                                fullWidth
                                onClick={handleAdminClick}
                                startIcon={<AdminPanelSettingsIcon />}
                                sx={{
                                    py: 3,
                                    fontSize: '1.2rem',
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    borderWidth: 2,
                                    '&:hover': {
                                        borderWidth: 2,
                                        transform: 'translateY(-2px)',
                                        boxShadow: 3,
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                Painel Administrativo
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Container>
    );
};