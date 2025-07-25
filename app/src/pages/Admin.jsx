import React, { useState, useEffect, useRef } from 'react';

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

  return (
    <div>
      <h2>Pacientes aguardando triagem</h2>
      <ul>
        {pacientes.map(p => (
          <li key={p.id} onClick={() => handleSelect(p.id)}>
            <b>{p.user_name}</b> - Prioridade: {p.user_priority} - Motivo: {p.reason}
          </li>
        ))}
      </ul>
      {historico && (
        <div>
          <h3>Histórico de {historico.user_name}</h3>
          <p>Prioridade: {historico.user_priority}</p>
          <p>Motivo: {historico.reason}</p>
          <p>Status: {historico.user_status}</p>
          {historico.user_status === "aguardando" && (
            <button onClick={() => handleStatus("atendimento")}>Chamar para atendimento</button>
          )}
          {historico.user_status === "atendimento" && (
            <button onClick={() => handleStatus("atendido")}>Finalizar atendimento</button>
          )}
        </div>
      )}
    </div>
  );
};