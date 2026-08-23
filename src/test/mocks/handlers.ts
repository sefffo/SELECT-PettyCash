import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const API_URL = 'http://localhost:8080/api';

export const handlers = [
  http.get(`${API_URL}/users`, () =>
    HttpResponse.json({
      data: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ],
      total: 2,
      page: 1,
      limit: 10,
      message: 'Success',
      success: true,
    }),
  ),
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        statusCode: 0,
        message: 'Login successful',
        data: {
          token: 'mock-token',
          role: 'Manager',
        },
      });
    }
    return HttpResponse.json(
      { message: 'Invalid credentials', success: false },
      { status: 401 },
    );
  }),
];

export const server = setupServer(...handlers);
