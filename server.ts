import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON body parser with generous limit for backups
  app.use(express.json({ limit: '50mb' }));

  const BACKUP_DIR = path.resolve(__dirname, 'backup');

  // Ensure backup folder exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // API endpoint: Get latest backup file
  app.get('/api/backups/latest', (req, res) => {
    try {
      if (!fs.existsSync(BACKUP_DIR)) {
        return res.json({ success: false, message: 'Diretório de backup não encontrado' });
      }

      const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => {
          const fullPath = path.join(BACKUP_DIR, f);
          const stat = fs.statSync(fullPath);
          return {
            filename: f,
            path: fullPath,
            mtimeMs: stat.mtimeMs,
            size: stat.size,
          };
        })
        .sort((a, b) => b.mtimeMs - a.mtimeMs);

      if (files.length === 0) {
        return res.json({ success: true, backup: null });
      }

      const latest = files[0];
      const content = fs.readFileSync(latest.path, 'utf-8');
      const parsed = JSON.parse(content);

      return res.json({
        success: true,
        backup: {
          filename: latest.filename,
          modifiedAt: new Date(latest.mtimeMs).toISOString(),
          data: parsed,
        },
      });
    } catch (err: any) {
      console.error('Erro ao ler backup mais recente:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // API endpoint: List all backups
  app.get('/api/backups', (req, res) => {
    try {
      if (!fs.existsSync(BACKUP_DIR)) {
        return res.json({ success: true, backups: [] });
      }

      const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => {
          const fullPath = path.join(BACKUP_DIR, f);
          const stat = fs.statSync(fullPath);
          return {
            filename: f,
            modifiedAt: new Date(stat.mtimeMs).toISOString(),
            size: stat.size,
          };
        })
        .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());

      return res.json({ success: true, backups: files });
    } catch (err: any) {
      console.error('Erro ao listar backups:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // API endpoint: Save backup to /backup directory
  app.post('/api/backups/export', (req, res) => {
    try {
      const backupData = req.body;
      if (!backupData || typeof backupData !== 'object') {
        return res.status(400).json({ success: false, message: 'Dados de backup inválidos' });
      }

      if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
      }

      // Generate filename with timestamp: backloggd-backup-YYYY-MM-DD-HHmmss.json
      const now = new Date();
      const datePart = now.toISOString().split('T')[0];
      const timePart = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `backloggd-backup-${datePart}-${timePart}.json`;
      const filePath = path.join(BACKUP_DIR, filename);

      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf-8');

      return res.json({
        success: true,
        message: 'Backup exportado com sucesso para a pasta /backup',
        filename,
        path: `backup/${filename}`,
        savedAt: now.toISOString(),
      });
    } catch (err: any) {
      console.error('Erro ao exportar backup para pasta /backup:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite development middlewares or static files in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`> Servidor Backloggd rodando em http://localhost:${PORT}`);
  });
}

startServer();
