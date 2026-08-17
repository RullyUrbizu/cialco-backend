import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiDataService } from './ai.data.service';
import { anonimizar, ejecutarHerramienta } from './ai.tools';
import { ManualSeccion, obtenerManual } from './manual-de-uso';

describe('AiService', () => {
  let service: AiService;

  const mockConfig = {
    get: jest.fn<string | undefined, [string]>(() => undefined),
  };

  const mockDataService = {
    listarToros: jest.fn(),
    stockPorToro: jest.fn(),
    listarColectas: jest.fn(),
    ocupacionTermos: jest.fn(),
    listarMovimientos: jest.fn(),
    listarClientes: jest.fn(),
    razonSocialPorIds: jest.fn(),
    resumenGlobal: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: ConfigService, useValue: mockConfig },
        { provide: AiDataService, useValue: mockDataService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('chat', () => {
    it('devuelve mensaje de no configurado si no hay API key', async () => {
      const res = await service.chat([
        { role: 'user', content: '¿qué stock hay?' },
      ]);
      expect(res.reply).toContain('no está configurado');
      expect(mockDataService.listarToros).not.toHaveBeenCalled();
    });

    it('devuelve el resultado final tras el ciclo de function calling, reenviando el thoughtSignature', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'AI_API_KEY' ? 'clave-de-prueba' : undefined,
      );
      const module = await Test.createTestingModule({
        providers: [
          AiService,
          { provide: ConfigService, useValue: mockConfig },
          { provide: AiDataService, useValue: mockDataService },
        ],
      }).compile();
      const servicioConClave = module.get<AiService>(AiService);

      mockDataService.resumenGlobal.mockResolvedValue({
        totalToros: 57,
      });

      interface CuerpoEnviado {
        contents: Array<{
          parts: Array<{
            functionCall?: { name: string };
            thoughtSignature?: string;
            functionResponse?: { name: string; response: unknown };
          }>;
        }>;
      }
      let segundoBody: CuerpoEnviado | undefined;

      const llamada = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => ({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      functionCall: { name: 'resumen_global', args: {} },
                      thoughtSignature: 'firma-de-prueba',
                    },
                  ],
                },
              },
            ],
          }),
        })
        .mockImplementationOnce((_url: unknown, init?: unknown) => {
          segundoBody = JSON.parse(
            (init as RequestInit | undefined)?.body as string,
          ) as CuerpoEnviado;
          return Promise.resolve({
            ok: true,
            json: () => ({
              candidates: [{ content: { parts: [{ text: 'Hay 57 toros.' }] } }],
            }),
          });
        });
      global.fetch = llamada as unknown as typeof fetch;

      const res = await servicioConClave.chat([
        { role: 'user', content: '¿cuántos toros hay?' },
      ]);

      expect(res.reply).toBe('Hay 57 toros.');
      expect(mockDataService.resumenGlobal).toHaveBeenCalled();
      const parteModelo = segundoBody?.contents[1]?.parts[0];
      expect(parteModelo?.thoughtSignature).toBe('firma-de-prueba');
      expect(parteModelo?.functionCall?.name).toBe('resumen_global');
      const respuestaTool =
        segundoBody?.contents[2]?.parts[0]?.functionResponse;
      expect(respuestaTool?.response).toEqual({ data: { totalToros: 57 } });
    });

    it('devuelve mensaje amigable si el servicio de IA falla', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'AI_API_KEY' ? 'clave-de-prueba' : undefined,
      );
      const module = await Test.createTestingModule({
        providers: [
          AiService,
          { provide: ConfigService, useValue: mockConfig },
          { provide: AiDataService, useValue: mockDataService },
        ],
      }).compile();
      const servicioConClave = module.get<AiService>(AiService);

      global.fetch = jest
        .fn()
        .mockRejectedValue(
          new Error('network down'),
        ) as unknown as typeof fetch;

      const res = await servicioConClave.chat([
        { role: 'user', content: 'hola' },
      ]);
      expect(res.reply).toContain('hubo un problema');
    });

    it('procesa varias llamadas a herramientas en una misma respuesta', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'AI_API_KEY' ? 'clave-de-prueba' : undefined,
      );
      const module = await Test.createTestingModule({
        providers: [
          AiService,
          { provide: ConfigService, useValue: mockConfig },
          { provide: AiDataService, useValue: mockDataService },
        ],
      }).compile();
      const servicioConClave = module.get<AiService>(AiService);

      mockDataService.resumenGlobal.mockResolvedValue({ totalToros: 57 });
      mockDataService.listarClientes.mockResolvedValue([
        { id: 'c-1', razonSocial: 'Campo Test', cuit: '20-1-1' },
      ]);

      interface CuerpoEnviado {
        contents: Array<{
          parts: Array<{
            functionCall?: { name: string };
            functionResponse?: { name: string; response: unknown };
          }>;
        }>;
      }
      let segundoBody: CuerpoEnviado | undefined;

      const llamada = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => ({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      functionCall: { name: 'resumen_global', args: {} },
                      thoughtSignature: 'firma-1',
                    },
                    {
                      functionCall: {
                        name: 'listar_clientes',
                        args: { busqueda: 'campo' },
                      },
                      thoughtSignature: 'firma-2',
                    },
                  ],
                },
              },
            ],
          }),
        })
        .mockImplementationOnce((_url: unknown, init?: unknown) => {
          segundoBody = JSON.parse(
            (init as RequestInit | undefined)?.body as string,
          ) as CuerpoEnviado;
          return Promise.resolve({
            ok: true,
            json: () => ({
              candidates: [{ content: { parts: [{ text: 'Listo.' }] } }],
            }),
          });
        });
      global.fetch = llamada as unknown as typeof fetch;

      const res = await servicioConClave.chat([
        { role: 'user', content: 'hola' },
      ]);

      expect(res.reply).toBe('Listo.');
      expect(mockDataService.resumenGlobal).toHaveBeenCalled();
      expect(mockDataService.listarClientes).toHaveBeenCalledWith('campo');
      const partesModelo = segundoBody?.contents[1]?.parts ?? [];
      expect(partesModelo.map((p) => p.functionCall?.name)).toEqual([
        'resumen_global',
        'listar_clientes',
      ]);
      const respuestasTool =
        segundoBody?.contents
          .filter((c) => c.parts[0]?.functionResponse)
          .map((c) => c.parts[0].functionResponse?.name) ?? [];
      expect(respuestasTool).toEqual(['resumen_global', 'listar_clientes']);
    });

    it('des-anonimiza la respuesta solo para mostrar cuando AI_ANONYMIZE=true', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'AI_API_KEY'
          ? 'clave-de-prueba'
          : key === 'AI_ANONYMIZE'
            ? 'true'
            : undefined,
      );
      const module = await Test.createTestingModule({
        providers: [
          AiService,
          { provide: ConfigService, useValue: mockConfig },
          { provide: AiDataService, useValue: mockDataService },
        ],
      }).compile();
      const servicioConClave = module.get<AiService>(AiService);

      const idCliente = 'a14c1d91-4d2a-58b8-9138-1611a2a3390f';
      mockDataService.razonSocialPorIds.mockResolvedValue(
        new Map([[idCliente, 'Las Tranqueras']]),
      );

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: `El cliente Cliente #${idCliente} tiene 23 colectas.`,
                  },
                ],
              },
            },
          ],
        }),
      }) as unknown as typeof fetch;

      const res = await servicioConClave.chat([
        { role: 'user', content: 'hola' },
      ]);

      expect(res.reply).toBe(
        `El cliente Cliente #${idCliente} tiene 23 colectas.`,
      );
      expect(res.display).toBe('El cliente Las Tranqueras tiene 23 colectas.');
      expect(mockDataService.razonSocialPorIds).toHaveBeenCalledWith([
        idCliente,
      ]);
    });

    it('no agrega display cuando AI_ANONYMIZE no está activo', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'AI_API_KEY' ? 'clave-de-prueba' : undefined,
      );
      const module = await Test.createTestingModule({
        providers: [
          AiService,
          { provide: ConfigService, useValue: mockConfig },
          { provide: AiDataService, useValue: mockDataService },
        ],
      }).compile();
      const servicioConClave = module.get<AiService>(AiService);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'Cliente #abc-123 sigue igual.' }],
              },
            },
          ],
        }),
      }) as unknown as typeof fetch;

      const res = await servicioConClave.chat([
        { role: 'user', content: 'hola' },
      ]);

      expect(res.reply).toBe('Cliente #abc-123 sigue igual.');
      expect(res.display).toBeUndefined();
      expect(mockDataService.razonSocialPorIds).not.toHaveBeenCalled();
    });

    it('reintenta ante errores de red transitorios y responde', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'AI_API_KEY' ? 'clave-de-prueba' : undefined,
      );
      const module = await Test.createTestingModule({
        providers: [
          AiService,
          { provide: ConfigService, useValue: mockConfig },
          { provide: AiDataService, useValue: mockDataService },
        ],
      }).compile();
      const servicioConClave = module.get<AiService>(AiService);

      let llamadas = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        llamadas++;
        if (llamadas <= 2) {
          return Promise.reject(new TypeError('network down'));
        }
        return Promise.resolve({
          ok: true,
          json: () => ({
            candidates: [{ content: { parts: [{ text: '¡Recuperado!' }] } }],
          }),
        });
      }) as unknown as typeof fetch;

      const res = await servicioConClave.chat([
        { role: 'user', content: 'hola' },
      ]);

      expect(res.reply).toBe('¡Recuperado!');
      expect(llamadas).toBe(3);
    }, 15000);

    it('reintenta ante errores de timeout y responde', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'AI_API_KEY' ? 'clave-de-prueba' : undefined,
      );
      const module = await Test.createTestingModule({
        providers: [
          AiService,
          { provide: ConfigService, useValue: mockConfig },
          { provide: AiDataService, useValue: mockDataService },
        ],
      }).compile();
      const servicioConClave = module.get<AiService>(AiService);

      const errorDeTiempo = new Error('timeout');
      errorDeTiempo.name = 'TimeoutError';
      let llamadas = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        llamadas++;
        if (llamadas === 1) {
          return Promise.reject(errorDeTiempo);
        }
        return Promise.resolve({
          ok: true,
          json: () => ({
            candidates: [
              { content: { parts: [{ text: 'OK tras timeout.' }] } },
            ],
          }),
        });
      }) as unknown as typeof fetch;

      const res = await servicioConClave.chat([
        { role: 'user', content: 'hola' },
      ]);

      expect(res.reply).toBe('OK tras timeout.');
      expect(llamadas).toBe(2);
    }, 15000);

    it('devuelve mensaje amigable ante un error 400 no transitorio', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'AI_API_KEY' ? 'clave-de-prueba' : undefined,
      );
      const module = await Test.createTestingModule({
        providers: [
          AiService,
          { provide: ConfigService, useValue: mockConfig },
          { provide: AiDataService, useValue: mockDataService },
        ],
      }).compile();
      const servicioConClave = module.get<AiService>(AiService);

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve('{"error":"bad request"}'),
      }) as unknown as typeof fetch;

      const res = await servicioConClave.chat([
        { role: 'user', content: 'hola' },
      ]);

      expect(res.reply).toContain('hubo un problema');
      expect(global.fetch as unknown as jest.Mock).toHaveBeenCalledTimes(1);
    });

    it('frena tras el máximo de iteraciones si el modelo nunca deja de llamar herramientas', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'AI_API_KEY' ? 'clave-de-prueba' : undefined,
      );
      const module = await Test.createTestingModule({
        providers: [
          AiService,
          { provide: ConfigService, useValue: mockConfig },
          { provide: AiDataService, useValue: mockDataService },
        ],
      }).compile();
      const servicioConClave = module.get<AiService>(AiService);

      mockDataService.listarToros.mockResolvedValue([]);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => ({
          candidates: [
            {
              content: {
                parts: [{ functionCall: { name: 'listar_toros', args: {} } }],
              },
            },
          ],
        }),
      }) as unknown as typeof fetch;

      const res = await servicioConClave.chat([
        { role: 'user', content: 'hola' },
      ]);

      expect(res.reply).toBe(
        'No pude completar la consulta con los datos disponibles. Probá con una pregunta más específica.',
      );
      expect(global.fetch as unknown as jest.Mock).toHaveBeenCalledTimes(6);
    });

    it('des-anonimiza varios clientes y deja intactos los ids desconocidos', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'AI_API_KEY'
          ? 'clave-de-prueba'
          : key === 'AI_ANONYMIZE'
            ? 'true'
            : undefined,
      );
      const module = await Test.createTestingModule({
        providers: [
          AiService,
          { provide: ConfigService, useValue: mockConfig },
          { provide: AiDataService, useValue: mockDataService },
        ],
      }).compile();
      const servicioConClave = module.get<AiService>(AiService);

      const id1 = 'a14c1d91-4d2a-58b8-9138-1611a2a3390f';
      const id2 = 'b24d2ea2-5e3b-69c9-a249-2722b3b44a10';
      mockDataService.razonSocialPorIds.mockResolvedValue(
        new Map([
          [id1, 'Las Tranqueras'],
          [id2, 'Campo El Mirador'],
        ]),
      );

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: `Clientes: Cliente #${id1} y Cliente #${id2}. Desconocido: Cliente #zz99-no-matchea.`,
                  },
                ],
              },
            },
          ],
        }),
      }) as unknown as typeof fetch;

      const res = await servicioConClave.chat([
        { role: 'user', content: 'hola' },
      ]);

      expect(res.reply).toBe(
        `Clientes: Cliente #${id1} y Cliente #${id2}. Desconocido: Cliente #zz99-no-matchea.`,
      );
      expect(res.display).toBe(
        'Clientes: Las Tranqueras y Campo El Mirador. Desconocido: Cliente #zz99-no-matchea.',
      );
      expect(mockDataService.razonSocialPorIds).toHaveBeenCalledWith([
        id1,
        id2,
      ]);
    });

    it('mapea los roles de user y assistant para Gemini', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'AI_API_KEY' ? 'clave-de-prueba' : undefined,
      );
      const module = await Test.createTestingModule({
        providers: [
          AiService,
          { provide: ConfigService, useValue: mockConfig },
          { provide: AiDataService, useValue: mockDataService },
        ],
      }).compile();
      const servicioConClave = module.get<AiService>(AiService);

      let cuerpo: { contents: Array<{ role: string }> } | undefined;
      global.fetch = jest
        .fn()
        .mockImplementation((_url: unknown, init?: unknown) => {
          cuerpo = JSON.parse(
            (init as RequestInit | undefined)?.body as string,
          ) as { contents: Array<{ role: string }> };
          return Promise.resolve({
            ok: true,
            json: () => ({
              candidates: [{ content: { parts: [{ text: 'Listo.' }] } }],
            }),
          });
        }) as unknown as typeof fetch;

      const res = await servicioConClave.chat([
        { role: 'user', content: 'hola' },
        { role: 'assistant', content: 'respuesta previa' },
      ]);

      expect(res.reply).toBe('Listo.');
      expect(cuerpo?.contents.map((c) => c.role)).toEqual(['user', 'model']);
    });

    it('rota a la siguiente clave cuando la primera agota su cuota', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'AI_API_KEYS' ? 'clave-1, clave-2' : undefined,
      );
      const module = await Test.createTestingModule({
        providers: [
          AiService,
          { provide: ConfigService, useValue: mockConfig },
          { provide: AiDataService, useValue: mockDataService },
        ],
      }).compile();
      const servicioConClave = module.get<AiService>(AiService);

      const urls: string[] = [];
      const llamada = jest
        .fn()
        .mockImplementationOnce((url: unknown) => {
          urls.push(String(url));
          return Promise.resolve({
            ok: false,
            status: 429,
            text: () => Promise.resolve('{}'),
          });
        })
        .mockImplementationOnce((url: unknown) => {
          urls.push(String(url));
          return Promise.resolve({
            ok: true,
            json: () => ({
              candidates: [
                {
                  content: {
                    parts: [{ text: 'Ok con la segunda clave.' }],
                  },
                },
              ],
            }),
          });
        });
      global.fetch = llamada as unknown as typeof fetch;

      const res = await servicioConClave.chat([
        { role: 'user', content: 'hola' },
      ]);

      expect(res.reply).toBe('Ok con la segunda clave.');
      expect(llamada).toHaveBeenCalledTimes(2);
      expect(urls[0]).toContain('key=clave-1');
      expect(urls[1]).toContain('key=clave-2');
    });

    it('devuelve mensaje de límite agotado si todas las claves quedan sin cuota', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'AI_API_KEYS' ? 'clave-1,clave-2' : undefined,
      );
      const module = await Test.createTestingModule({
        providers: [
          AiService,
          { provide: ConfigService, useValue: mockConfig },
          { provide: AiDataService, useValue: mockDataService },
        ],
      }).compile();
      const servicioConClave = module.get<AiService>(AiService);

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: () => Promise.resolve('{}'),
      }) as unknown as typeof fetch;

      const res = await servicioConClave.chat([
        { role: 'user', content: 'hola' },
      ]);

      expect(res.reply).toContain('Se agotó el límite diario');
    });

    it('usa el modelo de respaldo cuando el principal devuelve 503', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'AI_API_KEYS'
          ? 'clave-1'
          : key === 'AI_MODELS'
            ? 'modelo-a, modelo-b'
            : undefined,
      );
      const module = await Test.createTestingModule({
        providers: [
          AiService,
          { provide: ConfigService, useValue: mockConfig },
          { provide: AiDataService, useValue: mockDataService },
        ],
      }).compile();
      const servicioConClave = module.get<AiService>(AiService);

      const urls: string[] = [];
      const llamada = jest.fn().mockImplementation((url: unknown) => {
        urls.push(String(url));
        if (String(url).includes('models/modelo-a')) {
          return Promise.resolve({
            ok: false,
            status: 503,
            text: () => Promise.resolve('{}'),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => ({
            candidates: [
              { content: { parts: [{ text: 'Ok con el modelo B.' }] } },
            ],
          }),
        });
      });
      global.fetch = llamada as unknown as typeof fetch;

      const res = await servicioConClave.chat([
        { role: 'user', content: 'hola' },
      ]);

      expect(res.reply).toBe('Ok con el modelo B.');
      expect(llamada).toHaveBeenCalledTimes(2);
      expect(urls[0]).toContain('models/modelo-a');
      expect(urls[1]).toContain('models/modelo-b');
    }, 15000);

    it('devuelve mensaje de mucha demanda si todos los modelos dan 503', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'AI_API_KEYS'
          ? 'clave-1'
          : key === 'AI_MODELS'
            ? 'modelo-a, modelo-b'
            : undefined,
      );
      const module = await Test.createTestingModule({
        providers: [
          AiService,
          { provide: ConfigService, useValue: mockConfig },
          { provide: AiDataService, useValue: mockDataService },
        ],
      }).compile();
      const servicioConClave = module.get<AiService>(AiService);

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
        text: () => Promise.resolve('{}'),
      }) as unknown as typeof fetch;

      const res = await servicioConClave.chat([
        { role: 'user', content: 'hola' },
      ]);

      expect(res.reply).toContain('mucha demanda');
    }, 15000);
  });

  describe('anonimizar', () => {
    it('reemplaza razón social y elimina CUIT cuando está habilitado', () => {
      const resultado = anonimizar(
        [{ id: 'c-1', razonSocial: 'Campo Test', cuit: '20-12345678-9' }],
        true,
      ) as Array<{ razonSocial: string }>;
      expect(resultado[0].razonSocial).toBe('Cliente #c-1');
      expect(resultado[0]).not.toHaveProperty('cuit');
    });

    it('deja los datos intactos cuando no está habilitado', () => {
      const original = [
        { id: 'c-1', razonSocial: 'Campo Test', cuit: '20-12345678-9' },
      ];
      const resultado = anonimizar(original, false);
      expect(resultado).toEqual(original);
    });

    it('reemplaza razón social y elimina CUIT en objetos anidados', () => {
      const resultado = anonimizar(
        {
          cliente: {
            id: 'c-1',
            razonSocial: 'Campo Test',
            cuit: '20-12345678-9',
          },
          detalle: [
            {
              id: 'c-2',
              razonSocial: 'Otro Campo',
              cuit: '27-12345678-1',
              nombre: 'Sin datos',
            },
          ],
        },
        true,
      ) as Record<string, unknown>;

      const cliente = resultado.cliente as Record<string, unknown>;
      expect(cliente.razonSocial).toBe('Cliente #c-1');
      expect(cliente).not.toHaveProperty('cuit');

      const detalle = resultado.detalle as Array<Record<string, unknown>>;
      expect(detalle[0].razonSocial).toBe('Cliente #c-2');
      expect(detalle[0]).not.toHaveProperty('cuit');
      expect(detalle[0].nombre).toBe('Sin datos');
    });
  });

  describe('ejecutarHerramienta', () => {
    it('manual_de_uso devuelve secciones', async () => {
      const resultado = await ejecutarHerramienta(
        'manual_de_uso',
        { seccion: 'toro' },
        mockDataService as unknown as AiDataService,
        true,
      );
      const secciones = resultado as ManualSeccion[];
      expect(secciones.length).toBeGreaterThan(0);
      expect(secciones.some((s) => s.seccion === 'Toros')).toBe(true);
    });

    it('maneja herramientas desconocidas', async () => {
      const resultado = await ejecutarHerramienta(
        'hackear_db',
        {},
        mockDataService as unknown as AiDataService,
        true,
      );
      expect(resultado).toHaveProperty('error');
    });
  });

  describe('obtenerManual', () => {
    it('devuelve todo el manual si no se filtra', () => {
      expect(obtenerManual().length).toBeGreaterThan(0);
    });

    it('filtra por sección', () => {
      const res = obtenerManual('termos');
      expect(res.some((s) => s.seccion === 'Termos')).toBe(true);
    });
  });
});
