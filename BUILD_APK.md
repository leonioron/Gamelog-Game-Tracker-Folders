# Como Gerar e Baixar o APK Android do Gamelog

O **Gamelog** já está configurado com **Capacitor** (`capacitor.config.ts` e pasta `android/`) e um fluxo automatizado no **GitHub Actions** (`.github/workflows/build-apk.yml`) para compilar o arquivo `.apk` na nuvem, sem precisar instalar o Android Studio no seu computador.

---

## 📱 Opção 1: Gerar e Baixar o APK pelo GitHub Actions (Recomendado)

O workflow é executado automaticamente a cada `push` nas branches `main` ou `master`, ou manualmente a qualquer momento.

### Passo a Passo

1. **Envie o projeto para um repositório no GitHub** (`main` ou `master`):
   ```bash
   git add .
   git commit -m "Configura Gamelog mobile-first e Capacitor Android"
   git push origin main
   ```

2. **Acesse a aba `Actions` no GitHub**:
   - No seu repositório do GitHub, clique na aba **Actions**.
   - Selecione o workflow **Build Android APK (Debug)** na lista à esquerda.

3. **Disparo manual (opcional)**:
   - Clique em **Run workflow** → escolha a branch (`main` ou `master`) → clique no botão verde **Run workflow**.

4. **Baixe o APK gerado**:
   - Aguarde a execução do job **Build Gamelog APK** finalizar com o ícone verde (✓).
   - Clique sobre a execução concluída e role até a seção **Artifacts**.
   - Clique em **`gamelog-debug-apk`** para baixar o arquivo `.zip` contendo o **`app-debug.apk`**.

5. **Instale no seu celular Android**:
   - Extraia o arquivo `app-debug.apk` no celular ou transfira via cabo/Drive.
   - Toque no `.apk` para instalar (caso solicitado, habilite *"Instalar apps desconhecidos"* para o seu gerenciador de arquivos).

---

## 🛠️ Opção 2: Compilar o APK Localmente (Terminal / Android Studio)

Caso você já tenha **Java 21** e o **Android SDK** instalados localmente:

```bash
# 1. Instalar dependências
npm install

# 2. Gerar build Web + sincronizar com o projeto Android
npm run android:sync

# 3. Compilar o APK Debug via Gradle
cd android
./gradlew assembleDebug
```

O arquivo gerado ficará em:
`android/app/build/outputs/apk/debug/app-debug.apk`

Para abrir diretamente no Android Studio:
```bash
npm run android:open
```

---

## ⚙️ O que já está configurado para evitar erros de build

- **Espelho Maven Central do Google** (`https://maven-central.storage-download.googleapis.com/maven2/`) configurado no `android/build.gradle` e via `init.d` no GitHub Actions, evitando erros `HTTP 429` durante o download de dependências Gradle.
- **Java 21 (Temurin)** e **Node 22** configurados no workflow.
- **Aceite automático de licenças do Android SDK** usando o `sdkmanager` já pré-instalado no runner do GitHub.
- **Assets 100% locais em `public/`** e persistência **IndexedDB + localStorage**, permitindo funcionamento completo mesmo offline no celular.
