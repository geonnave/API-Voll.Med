export function sanitizacaoPaciente(paciente) {
    const attributeSanitizations = {
      cpf: (value) => value.toString().replace(/[^0-9]/g, ''),
      nome: (value) => value.trim(),
      email: (value) => value.trim(),
      senha: (value) => value.trim(),
      telefone: (value) => value.replace(/[^0-9]/g, ''),
      endereco: {
        cep: (value) => value.toString().replace(/[^0-9]/g, ''),
        rua: (value) => value.trim(),
        estado: (value) => value.trim(),
        complemento: (value) => value.trim(),
        numero: (value) => parseInt(value, 10),
      },
    };
  
    const pacienteSanitizado = {};
  
    for (const key in paciente) {
      if (paciente.hasOwnProperty(key)) {
        const value = paciente[key];
        const sanizationRule = attributeSanitizations[key];
  
        if (sanizationRule) {
          if (typeof sanizationRule === 'object') {
            pacienteSanitizado[key] = {};
  
            for (const subKey in sanizationRule) {
              if (value.hasOwnProperty(subKey)) {
                pacienteSanitizado[key][subKey] = sanizationRule[subKey](value[subKey]);
              }
            }
          } else {
            pacienteSanitizado[key] = sanizationRule(value);
          }
        } else {
          pacienteSanitizado[key] = value;
        }
      }
    }
  
    return pacienteSanitizado;
  }  