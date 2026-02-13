// SFDC Report Analyzer - Main Application
class SFDCReportAnalyzer {
    constructor() {
        this.uploadedFiles = [];
        this.maxFiles = 5;
        this.MAX_CONTENT_LENGTH = 10000;
        this.apiKey = localStorage.getItem('gemini_api_key') || '';
        this.initializeElements();
        this.attachEventListeners();
        this.checkApiKey();
    }

    initializeElements() {
        this.uploadBox = document.getElementById('uploadBox');
        this.fileInput = document.getElementById('fileInput');
        this.selectFilesBtn = document.getElementById('selectFilesBtn');
        this.filesList = document.getElementById('filesList');
        this.apiKeySection = document.getElementById('apiKeySection');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
        this.actionSection = document.getElementById('actionSection');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsContent = document.getElementById('resultsContent');
        this.loading = document.getElementById('loading');
    }

    attachEventListeners() {
        // File selection
        this.selectFilesBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop
        this.uploadBox.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadBox.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadBox.addEventListener('drop', (e) => this.handleDrop(e));
        
        // API key
        this.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        this.apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveApiKey();
        });
        
        // Actions
        this.analyzeBtn.addEventListener('click', () => this.analyzeReports());
        this.clearBtn.addEventListener('click', () => this.clearAll());
    }

    checkApiKey() {
        if (this.apiKey) {
            this.apiKeyInput.value = '••••••••••••';
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadBox.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadBox.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadBox.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files);
        this.addFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.addFiles(files);
        e.target.value = ''; // Reset input
    }

    addFiles(files) {
        const validFiles = files.filter(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            return ['csv', 'xls', 'xlsx'].includes(ext);
        });

        const remainingSlots = this.maxFiles - this.uploadedFiles.length;
        const filesToAdd = validFiles.slice(0, remainingSlots);

        if (validFiles.length > remainingSlots) {
            this.showMessage(`Only ${remainingSlots} more file(s) can be added (max ${this.maxFiles})`, 'error');
        }

        filesToAdd.forEach(file => {
            if (!this.uploadedFiles.find(f => f.name === file.name)) {
                this.uploadedFiles.push(file);
            }
        });

        this.renderFilesList();
        this.updateUI();
    }

    removeFile(index) {
        this.uploadedFiles.splice(index, 1);
        this.renderFilesList();
        this.updateUI();
    }

    renderFilesList() {
        if (this.uploadedFiles.length === 0) {
            this.filesList.innerHTML = '';
            return;
        }

        this.filesList.innerHTML = `
            <h3>📋 Uploaded Files (${this.uploadedFiles.length}/${this.maxFiles})</h3>
            ${this.uploadedFiles.map((file, index) => `
                <div class="file-item">
                    <div class="file-info-content">
                        <div class="file-icon">📄</div>
                        <div class="file-details">
                            <h4>${file.name}</h4>
                            <p>${this.formatFileSize(file.size)} • ${file.type || 'Unknown type'}</p>
                        </div>
                    </div>
                    <button class="remove-btn" onclick="analyzer.removeFile(${index})">Remove</button>
                </div>
            `).join('')}
        `;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    updateUI() {
        if (this.uploadedFiles.length > 0) {
            if (!this.apiKey) {
                this.apiKeySection.style.display = 'block';
            } else {
                this.apiKeySection.style.display = 'none';
                this.actionSection.style.display = 'block';
            }
        } else {
            this.apiKeySection.style.display = 'none';
            this.actionSection.style.display = 'none';
            this.resultsSection.style.display = 'none';
        }
    }

    saveApiKey() {
        const key = this.apiKeyInput.value.trim();
        if (key && key !== '••••••••••••') {
            this.apiKey = key;
            localStorage.setItem('gemini_api_key', key);
            this.apiKeyInput.value = '••••••••••••';
            this.showMessage('API key saved successfully!', 'success');
            this.updateUI();
        } else {
            this.showMessage('Please enter a valid API key', 'error');
        }
    }

    async analyzeReports() {
        if (!this.apiKey) {
            this.showMessage('Please provide your Gemini API key first', 'error');
            return;
        }

        if (this.uploadedFiles.length === 0) {
            this.showMessage('Please upload at least one report', 'error');
            return;
        }

        this.loading.style.display = 'block';
        this.actionSection.style.display = 'none';
        this.resultsSection.style.display = 'none';

        try {
            // Read all files
            const fileContents = await Promise.all(
                this.uploadedFiles.map(file => this.readFileContent(file))
            );

            // Prepare the prompt for Gemini
            const prompt = this.buildAnalysisPrompt(fileContents);

            // Call Gemini API
            const analysis = await this.callGeminiAPI(prompt);

            // Display results
            this.displayResults(analysis);
        } catch (error) {
            console.error('Analysis error:', error);
            this.showMessage(`Analysis failed: ${error.message}`, 'error');
        } finally {
            this.loading.style.display = 'none';
            this.actionSection.style.display = 'block';
        }
    }

    async readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    content: e.target.result,
                    type: file.type
                });
            };
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    buildAnalysisPrompt(fileContents) {
        let prompt = `You are an expert Salesforce (SFDC) data analyst. I have uploaded ${fileContents.length} SFDC reports for analysis. Please analyze these reports and provide:\n\n`;
        prompt += `1. **Executive Summary**: A high-level overview of the key findings\n`;
        prompt += `2. **Detailed Analysis**: For each report, provide insights on:\n`;
        prompt += `   - Key metrics and trends\n`;
        prompt += `   - Notable patterns or anomalies\n`;
        prompt += `   - Performance indicators\n`;
        prompt += `3. **Cross-Report Insights**: Identify relationships and patterns across reports\n`;
        prompt += `4. **Recommendations**: Actionable recommendations based on the data\n`;
        prompt += `5. **Risk Areas**: Any potential concerns or areas requiring attention\n\n`;
        prompt += `Here are the reports:\n\n`;

        fileContents.forEach((file, index) => {
            prompt += `--- Report ${index + 1}: ${file.name} ---\n`;
            // Limit content to prevent token overflow
            const contentPreview = file.content.substring(0, this.MAX_CONTENT_LENGTH);
            prompt += contentPreview;
            if (file.content.length > this.MAX_CONTENT_LENGTH) {
                prompt += '\n... (content truncated for analysis)';
            }
            prompt += `\n\n`;
        });

        prompt += `Please provide a comprehensive analysis in a well-structured format with clear headings and bullet points.`;
        
        return prompt;
    }

    async callGeminiAPI(prompt) {
        const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        
        const response = await fetch(`${API_ENDPOINT}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid response from Gemini API');
        }

        return data.candidates[0].content.parts[0].text;
    }

    displayResults(analysis) {
        // Sanitize and convert markdown-style formatting to HTML safely
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        // Split into lines for better processing
        const lines = escapeHtml(analysis).split('\n');
        const htmlLines = [];
        const listItems = [];
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            // Check if it's a list item
            if (line.match(/^- /)) {
                listItems.push('<li>' + line.substring(2) + '</li>');
                continue;
            } else if (listItems.length > 0) {
                // Close previous list
                htmlLines.push('<ul>' + listItems.join('') + '</ul>');
                listItems.length = 0;
            }
            
            // Convert headers
            if (line.match(/^### /)) {
                line = '<h3>' + line.substring(4) + '</h3>';
            } else if (line.match(/^## /)) {
                line = '<h3>' + line.substring(3) + '</h3>';
            } else if (line.match(/^# /)) {
                line = '<h3>' + line.substring(2) + '</h3>';
            } else if (line.trim() === '') {
                line = '<br>';
            } else if (!line.match(/^</)) {
                // Only wrap in <p> if not already an HTML tag
                line = '<p>' + line + '</p>';
            }
            
            // Apply inline formatting (bold and italic)
            line = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            line = line.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            
            htmlLines.push(line);
        }
        
        // Close any remaining list
        if (listItems.length > 0) {
            htmlLines.push('<ul>' + listItems.join('') + '</ul>');
        }

        this.resultsContent.innerHTML = htmlLines.join('\n');
        this.resultsSection.style.display = 'block';
        
        // Scroll to results
        this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    showMessage(message, type) {
        const messageClass = type === 'error' ? 'error-message' : 'success-message';
        
        // Create message element safely without innerHTML
        const messageDiv = document.createElement('div');
        messageDiv.className = messageClass;
        messageDiv.textContent = message;
        
        // Insert message after action section or at top of results
        const insertPoint = this.actionSection.style.display !== 'none' 
            ? this.actionSection 
            : this.resultsSection;
        
        insertPoint.parentNode.insertBefore(messageDiv, insertPoint.nextSibling);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            const messageEl = document.querySelector(`.${messageClass}`);
            if (messageEl) messageEl.remove();
        }, 5000);
    }

    clearAll() {
        if (confirm('Are you sure you want to clear all files and results?')) {
            this.uploadedFiles = [];
            this.renderFilesList();
            this.updateUI();
            this.resultsSection.style.display = 'none';
            this.fileInput.value = '';
        }
    }
}

// Initialize the application
let analyzer;
document.addEventListener('DOMContentLoaded', () => {
    analyzer = new SFDCReportAnalyzer();
});
