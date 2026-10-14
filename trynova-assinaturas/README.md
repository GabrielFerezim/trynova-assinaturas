# Trynova Assinaturas

Aplicação React + Node.js para solicitar, visualizar e baixar assinaturas corporativas.

## Requisitos
- Node.js 20 ou superior
- npm 10 ou superior

## Instalação
```bash
npm install
npm run install:all
cp backend/.env.example backend/.env
npm run dev
```

Frontend: http://localhost:5173
API: http://localhost:3001

## Fluxo
1. Informe um e-mail cadastrado.
2. Em desenvolvimento, sem SMTP, o link aparece no console da API e na resposta.
3. Abra o link temporário.
4. Baixe a assinatura em PNG.

## SMTP
Preencha `backend/.env`. Sem SMTP configurado, o sistema usa modo de desenvolvimento.

## Imagens oficiais
Substitua os arquivos em `frontend/public/imagens/` pelas artes oficiais mantendo os nomes.
