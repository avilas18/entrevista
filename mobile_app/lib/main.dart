import 'dart:convert';
import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Peluquería Anita',
      home: NuevaCitaScreen(),
    );
  }
}

class NuevaCitaScreen extends StatefulWidget {
  const NuevaCitaScreen({super.key});

  @override
  State<NuevaCitaScreen> createState() => _NuevaCitaScreenState();
}

class _NuevaCitaScreenState extends State<NuevaCitaScreen> {
  final _formKey = GlobalKey<FormState>();
  final _clienteIdController = TextEditingController();
  DateTime? _fechaSeleccionada;
  TimeOfDay? _horaSeleccionada;
  List<dynamic> clientes = [];

  @override
  void initState() {
    super.initState();
    _fetchClientes(); // Obtener la lista de clientes al iniciar
  }

  // Obtener la lista de clientes desde el backend
  Future<void> _fetchClientes() async {
    try {
      final response = await http.get(Uri.parse('http://192.168.100.77:5000/clientes'));
      if (response.statusCode == 200) {
        setState(() {
          clientes = json.decode(response.body);
        });
      } else {
        log('❌ Error al obtener clientes: ${response.statusCode}');
      }
    } catch (e) {
      log('⚠️ Error en la solicitud: $e');
    }
  }

  // Seleccionar fecha
  Future<void> _seleccionarFecha(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
    );
    if (picked != null && picked != _fechaSeleccionada) {
      setState(() {
        _fechaSeleccionada = picked;
      });
    }
  }

  // Seleccionar hora
  Future<void> _seleccionarHora(BuildContext context) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );
    if (picked != null && picked != _horaSeleccionada) {
      setState(() {
        _horaSeleccionada = picked;
      });
    }
  }

  // Agendar cita
  Future<void> _agendarCita(BuildContext context) async {
    if (_fechaSeleccionada == null || _horaSeleccionada == null || _clienteIdController.text.isEmpty) {
      log('⚠️ Por favor, selecciona un cliente, una fecha y una hora');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Por favor, completa todos los campos'),
            backgroundColor: Colors.red,
          ),
        );
      }
      return;
    }

    // Combinar fecha y hora seleccionadas
    final fechaHora = DateTime(
      _fechaSeleccionada!.year,
      _fechaSeleccionada!.month,
      _fechaSeleccionada!.day,
      _horaSeleccionada!.hour,
      _horaSeleccionada!.minute,
    );

    // Depurar los datos que se enviarán al servidor
    log('Enviando datos al servidor:');
    log('Cliente ID: ${_clienteIdController.text}');
    log('Fecha: ${DateFormat('yyyy-MM-dd').format(fechaHora)}');
    log('Hora: ${DateFormat('HH:mm:ss').format(fechaHora)}');

    try {
      final response = await http.post(
        Uri.parse('http://192.168.100.77:5000/citas'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'cliente_id': _clienteIdController.text,
          'fecha': DateFormat('yyyy-MM-dd').format(fechaHora),
          'hora': DateFormat('HH:mm:ss').format(fechaHora),
        }),
      );

      // Depurar la respuesta del servidor
      log('Respuesta del servidor: ${response.statusCode} - ${response.body}');

      if (response.statusCode == 200) {
        final responseBody = json.decode(response.body);

        final success = responseBody['success'] ?? true;

        if (success) {
          log('✅ Cita agendada exitosamente');
          _limpiarCampos();

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Cita agendada exitosamente'),
                backgroundColor: Colors.green,
              ),
            );
          }
        } else {
          final errorMessage = responseBody['message'] ?? 'Error al agendar la cita';
          log('❌ Error en la respuesta del servidor: $errorMessage');
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Error: $errorMessage'),
                backgroundColor: Colors.red,
              ),
            );
          }
        }
      } else {
        log('❌ Error al agendar la cita: ${response.statusCode}');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Error al agendar la cita'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      log('⚠️ Error en la solicitud: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error en la solicitud'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  // Limpiar campos
  void _limpiarCampos() {
    setState(() {
      _fechaSeleccionada = null;
      _horaSeleccionada = null;
      _clienteIdController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nueva Cita')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              // Lista de clientes
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(labelText: 'Selecciona un cliente'),
                items: clientes.map((cliente) {
                  return DropdownMenuItem<String>(
                    value: cliente['id'].toString(),
                    child: Text(cliente['nombre']),
                  );
                }).toList(),
                onChanged: (value) {
                  _clienteIdController.text = value!;
                },
              ),
              const SizedBox(height: 20),

              // Seleccionar fecha
              ElevatedButton(
                onPressed: () => _seleccionarFecha(context),
                child: Text(
                  _fechaSeleccionada == null
                      ? 'Seleccionar Fecha'
                      : 'Fecha: ${DateFormat('yyyy-MM-dd').format(_fechaSeleccionada!)}',
                ),
              ),
              const SizedBox(height: 20),

              // Seleccionar hora
              ElevatedButton(
                onPressed: () => _seleccionarHora(context),
                child: Text(
                  _horaSeleccionada == null
                      ? 'Seleccionar Hora'
                      : 'Hora: ${_horaSeleccionada!.format(context)}',
                ),
              ),
              const SizedBox(height: 20),

              // Botón para agendar cita
              ElevatedButton(
                onPressed: () => _agendarCita(context),
                child: const Text('Agendar Cita'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}