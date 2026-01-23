# 🔌 Guia de Implementação de APIs Reais

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Backend - Estrutura de API](#backend---estrutura-de-api)
3. [Database Schema](#database-schema)
4. [Migração do Frontend](#migração-do-frontend)
5. [Integração com Email](#integração-com-email)
6. [Integração com WhatsApp](#integração-com-whatsapp)
7. [Upload de Arquivos](#upload-de-arquivos)
8. [Geração de PDF](#geração-de-pdf)
9. [Autenticação e Segurança](#autenticação-e-segurança)
10. [Deploy e Produção](#deploy-e-produção)

---

## 🎯 Visão Geral

Este guia detalha como migrar o sistema de **localStorage** para um **backend completo com API REST**.

### Arquitetura Atual (Desenvolvimento)

```
Frontend (React) → localStorage → Dados locais
```

### Arquitetura de Produção

```
Frontend (React) → API REST (Node.js/Express) → Database (PostgreSQL/MySQL) → Serviços (Email, WhatsApp, Storage)
```

---

## 🖥️ Backend - Estrutura de API

### Tecnologias Recomendadas

**Opção 1: Node.js + Express + TypeScript**
- Rápido desenvolvimento
- TypeScript nativo
- Grande ecossistema

**Opção 2: Node.js + NestJS + TypeScript**
- Estrutura empresarial
- Injeção de dependências
- Documentação automática (Swagger)

**Opção 3: Python + FastAPI**
- Excelente documentação automática
- Type hints nativos
- Alto desempenho

### Exemplo: Node.js + Express + TypeScript

#### Estrutura de Pastas

```
backend/
├── src/
│   ├── controllers/
│   │   ├── announcements.controller.ts
│   │   ├── diagnostics.controller.ts
│   │   ├── users.controller.ts
│   │   ├── referrals.controller.ts
│   │   └── admin.controller.ts
│   ├── models/
│   │   ├── Announcement.ts
│   │   ├── Diagnostic.ts
│   │   ├── User.ts
│   │   └── Referral.ts
│   ├── routes/
│   │   ├── announcements.routes.ts
│   │   ├── diagnostics.routes.ts
│   │   ├── users.routes.ts
│   │   └── admin.routes.ts
│   ├── services/
│   │   ├── email.service.ts
│   │   ├── whatsapp.service.ts
│   │   ├── pdf.service.ts
│   │   ├── storage.service.ts
│   │   └── ai.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── config/
│   │   ├── database.ts
│   │   ├── services.ts
│   │   └── env.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── .env
```

#### Instalação

```bash
npm init -y
npm install express cors dotenv
npm install @prisma/client
npm install nodemailer
npm install axios
npm install multer
npm install pdfkit
npm install -D typescript @types/node @types/express ts-node nodemon
```

#### server.ts

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import announcementsRoutes from './routes/announcements.routes';
import diagnosticsRoutes from './routes/diagnostics.routes';
import usersRoutes from './routes/users.routes';
import referralsRoutes from './routes/referrals.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/announcements', announcementsRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

---

## 💾 Database Schema

### Prisma Schema (PostgreSQL)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String       @id @default(uuid())
  fullName    String
  email       String       @unique
  whatsapp    String
  legalArea   String
  responses   Json
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  diagnostics Diagnostic[]
  referrals   Referral[]   @relation("Referrer")

  @@map("users")
}

model Diagnostic {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  areaId       String
  areaName     String
  responses    Json
  totalScore   Int
  urgencyLevel String
  aiReport     String   @db.Text
  createdAt    DateTime @default(now())

  @@map("diagnostics")
  @@index([userId])
  @@index([createdAt])
}

model Referral {
  id                String   @id @default(uuid())
  referrerId        String
  referrer          User     @relation("Referrer", fields: [referrerId], references: [id])
  referredName      String
  referredWhatsapp  String
  invitationSent    Boolean  @default(false)
  invitationSentAt  DateTime?
  converted         Boolean  @default(false)
  createdAt         DateTime @default(now())

  @@map("referrals")
  @@index([referrerId])
}

model Announcement {
  id           String   @id @default(uuid())
  position     Int      @unique
  imageUrl     String
  validFrom    DateTime
  validTo      DateTime
  websiteUrl   String?
  facebookUrl  String?
  instagramUrl String?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("announcements")
  @@index([position])
}

model Terms {
  id        String   @id @default(uuid())
  content   String   @db.Text
  version   Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("terms")
}

model AdminUser {
  id           String   @id @default(uuid())
  username     String   @unique
  passwordHash String
  email        String   @unique
  role         String   @default("admin")
  lastLoginAt  DateTime?
  createdAt    DateTime @default(now())

  @@map("admin_users")
}
```

### Migração

```bash
# Inicializar Prisma
npx prisma init

# Criar migration
npx prisma migrate dev --name init

# Gerar client
npx prisma generate
```

---

## 🔄 Migração do Frontend

### Atualizar data-service.ts

**Antes (localStorage):**

```typescript
export const announcementsService = {
  getAll: (): Announcement[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return data ? JSON.parse(data) : [];
  },

  create: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Announcement => {
    const announcements = announcementsService.getAll();
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    announcements.push(newAnnouncement);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    return newAnnouncement;
  },
};
```

**Depois (API):**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options?.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const announcementsService = {
  getAll: async (): Promise<Announcement[]> => {
    return fetchAPI('/announcements');
  },

  getActive: async (): Promise<Announcement[]> => {
    return fetchAPI('/announcements/active');
  },

  create: async (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Announcement> => {
    return fetchAPI('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcement),
    });
  },

  update: async (id: string, updates: Partial<Announcement>): Promise<Announcement> => {
    return fetchAPI(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<void> => {
    await fetchAPI(`/announcements/${id}`, {
      method: 'DELETE',
    });
  },
};
```

### Backend Controller

```typescript
// src/controllers/announcements.controller.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AnnouncementsController {
  // GET /api/announcements
  async getAll(req: Request, res: Response) {
    try {
      const announcements = await prisma.announcement.findMany({
        orderBy: { position: 'asc' },
      });
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch announcements' });
    }
  }

  // GET /api/announcements/active
  async getActive(req: Request, res: Response) {
    try {
      const now = new Date();
      const announcements = await prisma.announcement.findMany({
        where: {
          isActive: true,
          validFrom: { lte: now },
          validTo: { gte: now },
        },
        orderBy: { position: 'asc' },
      });
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch active announcements' });
    }
  }

  // POST /api/announcements
  async create(req: Request, res: Response) {
    try {
      const announcement = await prisma.announcement.create({
        data: req.body,
      });
      res.status(201).json(announcement);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create announcement' });
    }
  }

  // PUT /api/announcements/:id
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const announcement = await prisma.announcement.update({
        where: { id },
        data: req.body,
      });
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update announcement' });
    }
  }

  // DELETE /api/announcements/:id
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.announcement.delete({
        where: { id },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete announcement' });
    }
  }
}
```

### Backend Routes

```typescript
// src/routes/announcements.routes.ts

import { Router } from 'express';
import { AnnouncementsController } from '../controllers/announcements.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new AnnouncementsController();

router.get('/', controller.getAll);
router.get('/active', controller.getActive);

// Protected routes (admin only)
router.post('/', authMiddleware, controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.delete);

export default router;
```

---

## 📧 Integração com Email

### Opção 1: SendGrid

```typescript
// src/services/email.service.ts

import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendDiagnosticEmail(params: {
  to: string;
  userName: string;
  legalArea: string;
  pdfBuffer: Buffer;
}) {
  const msg = {
    to: params.to,
    from: process.env.EMAIL_FROM!,
    subject: `Seu Diagnóstico Jurídico - ${params.legalArea}`,
    html: `
      <h1>Olá, ${params.userName}!</h1>
      <p>Seu diagnóstico jurídico de <strong>${params.legalArea}</strong> está pronto.</p>
      <p>Veja o relatório completo em anexo.</p>
    `,
    attachments: [
      {
        content: params.pdfBuffer.toString('base64'),
        filename: `Diagnostico_${params.legalArea}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ],
  };

  await sgMail.send(msg);
}
```

### Opção 2: Nodemailer (SMTP)

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendDiagnosticEmail(params: {
  to: string;
  userName: string;
  legalArea: string;
  pdfBuffer: Buffer;
}) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: params.to,
    subject: `Seu Diagnóstico Jurídico - ${params.legalArea}`,
    html: `
      <h1>Olá, ${params.userName}!</h1>
      <p>Seu diagnóstico está pronto.</p>
    `,
    attachments: [
      {
        filename: `Diagnostico_${params.legalArea}.pdf`,
        content: params.pdfBuffer,
      },
    ],
  });
}
```

### Variáveis de Ambiente (.env)

```env
# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxx
EMAIL_FROM=noreply@seusite.com.br

# OU SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
EMAIL_FROM=noreply@seusite.com.br
```

---

## 📱 Integração com WhatsApp

### Opção 1: Evolution API (Recomendado)

```typescript
// src/services/whatsapp.service.ts

import axios from 'axios';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL!;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY!;
const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE!;

export async function sendWhatsAppMessage(params: {
  phoneNumber: string;
  message: string;
}) {
  const url = `${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`;

  await axios.post(
    url,
    {
      number: params.phoneNumber.replace(/\D/g, ''), // Remove non-digits
      text: params.message,
    },
    {
      headers: {
        'apikey': EVOLUTION_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
}

export async function sendReferralInvitation(params: {
  friendName: string;
  friendWhatsApp: string;
  referredBy: string;
}) {
  const message = `Olá, ${params.friendName}! 👋\n\nSeu amigo ${params.referredBy} te indicou para fazer um diagnóstico jurídico gratuito.\n\nAcesse agora: ${process.env.FRONTEND_URL}`;

  await sendWhatsAppMessage({
    phoneNumber: params.friendWhatsApp,
    message,
  });
}
```

### Opção 2: Z-API

```typescript
import axios from 'axios';

const ZAPI_URL = process.env.ZAPI_URL!;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN!;
const INSTANCE_ID = process.env.ZAPI_INSTANCE!;

export async function sendWhatsAppMessage(params: {
  phoneNumber: string;
  message: string;
}) {
  const url = `${ZAPI_URL}/${INSTANCE_ID}/send-text`;

  await axios.post(
    url,
    {
      phone: params.phoneNumber,
      message: params.message,
    },
    {
      headers: {
        'Client-Token': ZAPI_TOKEN,
      },
    }
  );
}
```

### Variáveis de Ambiente

```env
# Evolution API
EVOLUTION_API_URL=https://evolution.sua-api.com
EVOLUTION_API_KEY=sua-chave-aqui
EVOLUTION_INSTANCE=instance-name

# Z-API
ZAPI_URL=https://api.z-api.io
ZAPI_TOKEN=seu-token
ZAPI_INSTANCE=sua-instancia

# Frontend URL (para links)
FRONTEND_URL=https://diagnosticojuridico.com.br
```

---

## 📁 Upload de Arquivos

### Backend: Multer + AWS S3

```typescript
// src/services/storage.service.ts

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  },
});

export async function uploadBannerImage(file: Express.Multer.File): Promise<string> {
  const key = `banners/${uuidv4()}-${file.originalname}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export const uploadMiddleware = upload.single('banner');
```

### Rota de Upload

```typescript
// src/routes/upload.routes.ts

import { Router } from 'express';
import { uploadMiddleware, uploadBannerImage } from '../services/storage.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/banner', authMiddleware, uploadMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = await uploadBannerImage(req.file);
    res.json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
```

### Frontend: Upload Component Update

```typescript
// src/components/admin/BannerUpload.tsx (adicionar)

const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('banner', file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload/banner`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: formData,
    });

    const data = await response.json();
    setPreviewUrl(data.imageUrl);
    onImageChange(data.imageUrl);
  } catch (error) {
    alert('Erro ao fazer upload. Tente novamente.');
  }
};
```

### Variáveis de Ambiente

```env
# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=seu-bucket-diagnostico
```

---

## 📄 Geração de PDF

### Backend: PDFKit

```typescript
// src/services/pdf.service.ts

import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export async function generateDiagnosticPDF(params: {
  userName: string;
  legalArea: string;
  totalScore: number;
  urgencyLevel: string;
  aiReport: string;
  announcements: Announcement[];
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('Diagnóstico Jurídico', { align: 'center' });

    doc.moveDown();

    // User info
    doc.fontSize(12).font('Helvetica');
    doc.text(`Nome: ${params.userName}`);
    doc.text(`Área: ${params.legalArea}`);
    doc.text(`Pontuação: ${params.totalScore}`);
    doc.text(`Urgência: ${params.urgencyLevel}`);

    doc.moveDown(2);

    // AI Report
    doc.fontSize(14).font('Helvetica-Bold').text('Análise Detalhada');
    doc.moveDown();
    doc.fontSize(11).font('Helvetica').text(params.aiReport, {
      align: 'justify',
      lineGap: 5,
    });

    // Announcements (banners)
    params.announcements.forEach((ad, idx) => {
      doc.addPage();
      doc.fontSize(10).font('Helvetica').text(`Espaço Publicitário ${idx + 1}`, { align: 'center' });

      if (ad.websiteUrl) {
        doc.fillColor('blue').text(ad.websiteUrl, { link: ad.websiteUrl });
      }
    });

    doc.end();
  });
}
```

---

## 🔐 Autenticação e Segurança

### JWT Authentication

```typescript
// src/middleware/auth.middleware.ts

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET!;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
```

### Login Endpoint

```typescript
// src/controllers/admin.controller.ts

import bcrypt from 'bcrypt';
import { generateToken } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminController {
  async login(req: Request, res: Response) {
    const { username, password } = req.body;

    const admin = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, admin.passwordHash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ id: admin.id, username: admin.username });

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    res.json({ token, user: { id: admin.id, username: admin.username } });
  }
}
```

---

## 🚀 Deploy e Produção

### Opção 1: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Backend (Railway):**

1. Conectar repositório GitHub
2. Configurar variáveis de ambiente
3. Deploy automático

### Opção 2: Docker

**Dockerfile (Backend):**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/diagnostico
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: diagnostico

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      VITE_API_URL: http://localhost:3001/api

volumes:
  postgres_data:
```

### Variáveis de Ambiente (Produção)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=seu-secret-muito-seguro-aqui

# APIs
SENDGRID_API_KEY=...
EVOLUTION_API_URL=...
EVOLUTION_API_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Frontend
VITE_API_URL=https://api.seusite.com.br/api
```

---

## 📊 Checklist de Migração

### Backend

- [ ] Configurar database (Prisma)
- [ ] Criar todos os controllers
- [ ] Implementar rotas REST
- [ ] Configurar autenticação JWT
- [ ] Integrar SendGrid/SMTP
- [ ] Integrar Evolution API/Z-API
- [ ] Configurar AWS S3 para uploads
- [ ] Implementar geração de PDF
- [ ] Testar todas as endpoints

### Frontend

- [ ] Atualizar `data-service.ts` com chamadas API
- [ ] Adicionar loading states
- [ ] Implementar tratamento de erros
- [ ] Configurar variáveis de ambiente
- [ ] Testar fluxo completo
- [ ] Deploy para produção

### Testes

- [ ] Cadastro de usuário
- [ ] Geração de diagnóstico
- [ ] Envio de email
- [ ] Envio de WhatsApp
- [ ] Upload de banner
- [ ] CRUD de anúncios
- [ ] Exportação CSV
- [ ] Login admin
- [ ] Relatórios

---

**Última atualização:** 10/11/2025
