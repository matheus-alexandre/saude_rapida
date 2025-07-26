import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import {
  Person,
  AccessTime,
  LocalHospital,
  CheckCircle,
  PriorityHigh,
  Schedule
} from '@mui/icons-material';

export const AdminPage = () => {
  const [pacientes, setPacientes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [historico, setHistorico] = useState(null);

  useEffect(() => {
    const fetchPacientes = () => {
        fetch("http://localhost:11435/admin/triage/patients")
        .then(res => res.json())
        .then(setPacientes);
    };
    fetchPacientes();
    const interval = setInterval(fetchPacientes, 5000);
    return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetch("http://localhost:11435/admin/triage/patients")
        .then(res => res.json())
        .then(setPacientes);
    }, []);

  const handleSelect = (id) => {
    setSelected(id);
    fetch(`http://localhost:11435/admin/user/history/${id}`)
      .then(res => res.json())
      .then(setHistorico);
  };

  const handleStatus = (status) => {
    fetch(`http://localhost:11435/admin/triage/status/${selected}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(status)
    }).then(() => {
      setHistorico(h => ({ ...h, user_status: status }));
      setPacientes(p => p.filter(x => x.id !== selected));
      setSelected(null);
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return 'error';
      case 'media': return 'warning';
      case 'baixa': return 'success';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'alta': return <PriorityHigh />;
      case 'media': return <Schedule />;
      case 'baixa': return <AccessTime />;
      default: return <AccessTime />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h1" color="primary" gutterBottom>
          Painel Administrativo
        </Typography>
        <Typography variant="h5" color="textSecondary">
          Gerenciamento de Triagem
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalHospital />
                Pacientes Aguardando Triagem
              </Typography>
              
              {pacientes.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Nenhum paciente aguardando triagem no momento.
                </Alert>
              ) : (
                <List>
                  {pacientes.map((p, index) => (
                    <React.Fragment key={p.id}>
                      <ListItem
                        onClick={() => handleSelect(p.id)}
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 2,
                          mb: 1,
                          bgcolor: selected === p.id ? 'action.selected' : 'transparent',
                          '&:hover': {
                            bgcolor: 'action.hover',
                            transform: 'translateX(4px)',
                            transition: 'all 0.2s ease'
                          },
                          border: selected === p.id ? 2 : 1,
                          borderColor: selected === p.id ? 'primary.main' : 'divider'
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Person color="primary" />
                              <Typography variant="h6" component="span">
                                {p.user_name}
                              </Typography>
                              <Chip
                                label={p.user_priority.toUpperCase()}
                                color={getPriorityColor(p.user_priority)}
                                size="small"
                                icon={getPriorityIcon(p.user_priority)}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="textSecondary">
                              <strong>Motivo:</strong> {p.reason}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < pacientes.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              {!historico ? (
                <Box textAlign="center" py={4}>
                  <Person sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    Selecione um paciente para ver os detalhes
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person />
                    Histórico de {historico.user_name}
                  </Typography>
                  
                  <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          {getPriorityIcon(historico.user_priority)}
                          <Typography variant="h6">
                            Prioridade: 
                            <Chip
                              label={historico.user_priority.toUpperCase()}
                              color={getPriorityColor(historico.user_priority)}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          <strong>Motivo:</strong> {historico.reason}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <strong>Status:</strong>
                          <Chip
                            label={historico.user_status.toUpperCase()}
                            color={historico.user_status === 'aguardando' ? 'warning' : 
                                   historico.user_status === 'atendimento' ? 'info' : 'success'}
                            variant="outlined"
                          />
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    {historico.user_status === "aguardando" && (
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => handleStatus("atendimento")}
                        startIcon={<LocalHospital />}
                        sx={{
                          py: 1.5,
                          px: 3,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          boxShadow: 3,
                          '&:hover': {
                            boxShadow: 6,
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Chamar para Atendimento
                      </Button>
                    )}
                    
                    {historico.user_status === "atendimento" && (
                      <Button
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={() => handleStatus("atendido")}
                        startIcon={<CheckCircle />}
                        sx={{
                          py: 1.5,
                          px: 3,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          boxShadow: 3,
                          '&:hover': {
                            boxShadow: 6,
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Finalizar Atendimento
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};