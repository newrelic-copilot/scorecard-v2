# SFDC Report Analyzer - Team Scorecard v2

A simple GitHub Pages application for uploading and analyzing Salesforce (SFDC) reports using Google Gemini AI.

## 🚀 Features

- **Upload Up to 5 Reports**: Support for CSV, XLS, and XLSX file formats
- **AI-Powered Analysis**: Uses Google Gemini AI to analyze your SFDC reports
- **Drag & Drop Interface**: Easy file upload with drag-and-drop support
- **Comprehensive Insights**: Get executive summaries, detailed analysis, cross-report insights, recommendations, and risk assessments
- **Privacy First**: API key stored locally in your browser, files processed client-side
- **Responsive Design**: Works on desktop and mobile devices

## 🔧 Setup

### For GitHub Pages

1. Go to your repository Settings → Pages
2. Under "Source", select the branch you want to deploy (e.g., `main` or `copilot/build-github-pages-app`)
3. Click Save
4. Your site will be available at `https://<username>.github.io/<repository-name>/`
   - Replace `<username>` with your GitHub username or organization name
   - Replace `<repository-name>` with your repository name

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key
5. Paste it into the application when prompted

## 📖 Usage

1. **Upload Reports**: 
   - Click "Select Files" or drag and drop your SFDC reports (CSV, XLS, or XLSX)
   - You can upload up to 5 reports at once

2. **Configure API Key**:
   - Enter your Google Gemini API key when prompted
   - The key is securely stored in your browser's local storage

3. **Analyze**:
   - Click "Analyze Reports" to start the AI analysis
   - Wait for the analysis to complete (usually takes 10-30 seconds)

4. **Review Results**:
   - View the comprehensive analysis including:
     - Executive Summary
     - Detailed Analysis per report
     - Cross-Report Insights
     - Actionable Recommendations
     - Risk Areas

## 🔒 Privacy & Security

- All file processing happens in your browser
- Your API key is stored locally and never sent to any server except Google's Gemini API
- Reports are not stored on any server
- No data is collected or retained by this application

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI Service**: Google Gemini API
- **Hosting**: GitHub Pages

## 📝 File Structure

```
scorecard-v2/
├── index.html      # Main HTML structure
├── styles.css      # Styling and responsive design
├── app.js          # Application logic and Gemini API integration
├── _config.yml     # GitHub Pages configuration
└── README.md       # Documentation
```

## 🤝 Contributing

Feel free to open issues or submit pull requests to improve the application.

## 📄 License

MIT License - feel free to use this for your own projects!
