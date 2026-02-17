
# VisageAI - Vercel Deployment Guide

Follow these steps to deploy your AI Face Shape Analyzer to Vercel.

## 1. Prepare your Repository
Ensure all files, including the new `package.json`, `vite.config.ts`, and `vercel.json`, are pushed to your GitHub/GitLab/Bitbucket repository.

## 2. Deploy to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New"** > **"Project"**.
3. Import your repository.
4. Vercel should automatically detect the **Vite** framework. If not, select it from the dropdown.

## 3. Configure Environment Variables (Crucial)
Before clicking "Deploy", you must add your Gemini API Key:
1. In the **Environment Variables** section, add a new entry:
   - **Key**: `API_KEY`
   - **Value**: `YOUR_ACTUAL_GOOGLE_GEMINI_API_KEY`
2. Click **"Add"**.

## 4. Finalize
1. Click **"Deploy"**.
2. Once the build finishes, your app will be live on an `https` URL.
3. **Note:** Browsers require `https` to access the camera, which Vercel provides by default.

## Local Development
To run this project locally:
1. `npm install`
2. `export API_KEY=your_key_here` (or create a `.env` file)
3. `npm run dev`
