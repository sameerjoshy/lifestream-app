// LifeStream Google Drive Storage
// Customer-first approach: Secure, private storage in user's own Drive

class DriveStorage {
    constructor() {
        this.APP_FOLDER_NAME = '.lifestream';
        this.appFolderId = null;
        this.isInitialized = false;
    }

    // Initialize Drive storage
    async init() {
        try {
            console.log('📁 Initializing Google Drive storage...');
            
            // Ensure Google Drive API is ready
            if (!gapi.client.drive) {
                await gapi.client.load('drive', 'v3');
            }

            // Create or find app folder
            await this.ensureAppFolder();
            
            this.isInitialized = true;
            console.log('✅ Drive storage initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Drive storage initialization failed:', error);
            return false;
        }
    }

    // Create or find the hidden app folder
    async ensureAppFolder() {
        try {
            // Search for existing app folder
            const response = await gapi.client.drive.files.list({
                q: `name='${this.APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                fields: 'files(id, name)'
            });

            if (response.result.files.length > 0) {
                // Folder exists
                this.appFolderId = response.result.files[0].id;
                console.log('📂 Found existing LifeStream folder:', this.appFolderId);
            } else {
                // Create new folder
                const folderResponse = await gapi.client.drive.files.create({
                    resource: {
                        name: this.APP_FOLDER_NAME,
                        mimeType: 'application/vnd.google-apps.folder',
                        parents: ['appDataFolder'] // Hidden from user's main Drive view
                    },
                    fields: 'id'
                });
                
                this.appFolderId = folderResponse.result.id;
                console.log('📁 Created new LifeStream folder:', this.appFolderId);
            }

            return this.appFolderId;
            
        } catch (error) {
            console.error('❌ Failed to create/find app folder:', error);
            throw error;
        }
    }

    // Save user activities to Drive
    async saveActivities(activities) {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            const fileName = 'activities.json';
            const fileContent = JSON.stringify({
                activities: activities,
                lastUpdated: new Date().toISOString(),
                version: '2.0'
            }, null, 2);

            // Check if file exists
            const existingFile = await this.findFile(fileName);
            
            if (existingFile) {
                // Update existing file
                await this.updateFile(existingFile.id, fileContent);
                console.log('✅ Activities updated in Drive');
            } else {
                // Create new file
                await this.createFile(fileName, fileContent);
                console.log('✅ Activities saved to Drive');
            }

            return true;
            
        } catch (error) {
            console.error('❌ Failed to save activities:', error);
            return false;
        }
    }

    // Load user activities from Drive
    async loadActivities() {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            const fileName = 'activities.json';
            const file = await this.findFile(fileName);
            
            if (!file) {
                console.log('📄 No activities file found, starting fresh');
                return [];
            }

            const content = await this.getFileContent(file.id);
            const data = JSON.parse(content);
            
            console.log('✅ Activities loaded from Drive:', data.activities.length, 'activities');
            return data.activities || [];
            
        } catch (error) {
            console.error('❌ Failed to load activities:', error);
            return [];
        }
    }

    // Save user stats to Drive
    async saveStats(stats) {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            const fileName = 'stats.json';
            const fileContent = JSON.stringify({
                stats: stats,
                lastUpdated: new Date().toISOString(),
                version: '2.0'
            }, null, 2);

            const existingFile = await this.findFile(fileName);
            
            if (existingFile) {
                await this.updateFile(existingFile.id, fileContent);
                console.log('✅ Stats updated in Drive');
            } else {
                await this.createFile(fileName, fileContent);
                console.log('✅ Stats saved to Drive');
            }

            return true;
            
        } catch (error) {
            console.error('❌ Failed to save stats:', error);
            return false;
        }
    }

    // Load user stats from Drive
    async loadStats() {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            const fileName = 'stats.json';
            const file = await this.findFile(fileName);
            
            if (!file) {
                console.log('📊 No stats file found, starting fresh');
                return null;
            }

            const content = await this.getFileContent(file.id);
            const data = JSON.parse(content);
            
            console.log('✅ Stats loaded from Drive');
            return data.stats || null;
            
        } catch (error) {
            console.error('❌ Failed to load stats:', error);
            return null;
        }
    }

    // Save user goals to Drive
    async saveGoals(goals) {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            const fileName = 'goals.json';
            const fileContent = JSON.stringify({
                goals: goals,
                lastUpdated: new Date().toISOString(),
                version: '2.0'
            }, null, 2);

            const existingFile = await this.findFile(fileName);
            
            if (existingFile) {
                await this.updateFile(existingFile.id, fileContent);
                console.log('✅ Goals updated in Drive');
            } else {
                await this.createFile(fileName, fileContent);
                console.log('✅ Goals saved to Drive');
            }

            return true;
            
        } catch (error) {
            console.error('❌ Failed to save goals:', error);
            return false;
        }
    }

    // Load user goals from Drive
    async loadGoals() {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            const fileName = 'goals.json';
            const file = await this.findFile(fileName);
            
            if (!file) {
                console.log('🎯 No goals file found, starting fresh');
                return [];
            }

            const content = await this.getFileContent(file.id);
            const data = JSON.parse(content);
            
            console.log('✅ Goals loaded from Drive:', data.goals.length, 'goals');
            return data.goals || [];
            
        } catch (error) {
            console.error('❌ Failed to load goals:', error);
            return [];
        }
    }

    // Helper: Find file by name in app folder
    async findFile(fileName) {
        try {
            const response = await gapi.client.drive.files.list({
                q: `name='${fileName}' and parents in '${this.appFolderId}' and trashed=false`,
                fields: 'files(id, name, modifiedTime)'
            });

            return response.result.files.length > 0 ? response.result.files[0] : null;
            
        } catch (error) {
            console.error('❌ Failed to find file:', error);
            return null;
        }
    }

    // Helper: Create new file
    async createFile(fileName, content) {
        try {
            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            const metadata = {
                name: fileName,
                parents: [this.appFolderId],
                mimeType: 'application/json'
            };

            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                content +
                close_delim;

            const request = gapi.client.request({
                path: 'https://www.googleapis.com/upload/drive/v3/files',
                method: 'POST',
                params: { uploadType: 'multipart' },
                headers: {
                    'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                },
                body: multipartRequestBody
            });

            return await request;
            
        } catch (error) {
            console.error('❌ Failed to create file:', error);
            throw error;
        }
    }

    // Helper: Update existing file
    async updateFile(fileId, content) {
        try {
            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                content +
                close_delim;

            const request = gapi.client.request({
                path: 'https://www.googleapis.com/upload/drive/v3/files/' + fileId,
                method: 'PATCH',
                params: { uploadType: 'multipart' },
                headers: {
                    'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                },
                body: multipartRequestBody
            });

            return await request;
            
        } catch (error) {
            console.error('❌ Failed to update file:', error);
            throw error;
        }
    }

    // Helper: Get file content
    async getFileContent(fileId) {
        try {
            const response = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });

            return response.body;
            
        } catch (error) {
            console.error('❌ Failed to get file content:', error);
            throw error;
        }
    }

    // Get storage info for user
    async getStorageInfo() {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            // List all LifeStream files
            const response = await gapi.client.drive.files.list({
                q: `parents in '${this.appFolderId}' and trashed=false`,
                fields: 'files(id, name, size, modifiedTime, createdTime)'
            });

            const files = response.result.files;
            const totalSize = files.reduce((sum, file) => sum + parseInt(file.size || 0), 0);

            return {
                fileCount: files.length,
                totalSize: totalSize,
                lastModified: files.length > 0 ? 
                    Math.max(...files.map(f => new Date(f.modifiedTime).getTime())) : null,
                files: files
            };
            
        } catch (error) {
            console.error('❌ Failed to get storage info:', error);
            return null;
        }
    }

    // Export all user data (for backup)
    async exportAllData() {
        try {
            const activities = await this.loadActivities();
            const stats = await this.loadStats();
            const goals = await this.loadGoals();

            const exportData = {
                exportDate: new Date().toISOString(),
                version: '2.0',
                activities: activities,
                stats: stats,
                goals: goals
            };

            return exportData;
            
        } catch (error) {
            console.error('❌ Failed to export data:', error);
            return null;
        }
    }
}

// Create global instance
if (!window.driveStorage) {
    window.driveStorage = new DriveStorage();
}
