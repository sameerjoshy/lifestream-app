// Google Drive Storage for LifeStream
class DriveStorage {
    constructor() {
        this.isInitialized = false;
        this.folderName = 'LifeStream_Data';
        this.folderId = null;
        this.demoMode = false;
        this.init();
    }

    async init() {
        try {
            console.log('📁 Initializing Google Drive storage...');
            
            // Wait for Google Auth to be ready
            await this.waitForAuth();
            
            if (googleAuth.isDemoMode) {
                this.setupDemoMode();
                return;
            }

            // Initialize Google Drive API
            await gapi.client.init({
                apiKey: 'YOUR_API_KEY_HERE', // Replace with your API key
                clientId: 'YOUR_CLIENT_ID_HERE', // Replace with your client ID
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                scope: 'https://www.googleapis.com/auth/drive.file'
            });

            await this.ensureDataFolder();
            this.isInitialized = true;
            
            console.log('✅ Google Drive storage initialized');
            
        } catch (error) {
            console.warn('⚠️ Drive storage initialization failed:', error);
            this.setupDemoMode();
        }
    }

    async waitForAuth() {
        return new Promise((resolve) => {
            const checkAuth = () => {
                if (typeof googleAuth !== 'undefined') {
                    resolve();
                } else {
                    setTimeout(checkAuth, 100);
                }
            };
            checkAuth();
        });
    }

    setupDemoMode() {
        console.log('📱 Drive storage in demo mode - using localStorage');
        this.demoMode = true;
        this.isInitialized = true;
    }

    async ensureDataFolder() {
        try {
            // Search for existing LifeStream folder
            const response = await gapi.client.drive.files.list({
                q: `name='${this.folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                spaces: 'drive'
            });

            if (response.result.files.length > 0) {
                this.folderId = response.result.files[0].id;
                console.log('📁 Found existing LifeStream folder');
            } else {
                // Create new folder
                const folderResponse = await gapi.client.drive.files.create({
                    resource: {
                        name: this.folderName,
                        mimeType: 'application/vnd.google-apps.folder'
                    }
                });
                
                this.folderId = folderResponse.result.id;
                console.log('📁 Created new LifeStream folder');
            }
            
        } catch (error) {
            console.warn('Folder creation error:', error);
            throw error;
        }
    }

    async saveFile(filename, data) {
        if (this.demoMode) {
            return this.saveToLocalStorage(filename, data);
        }

        try {
            const fileContent = JSON.stringify(data, null, 2);
            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            const metadata = {
                name: filename,
                parents: [this.folderId]
            };

            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                fileContent +
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

            const response = await request;
            console.log(`✅ Saved ${filename} to Drive`);
            return response.result;
            
        } catch (error) {
            console.warn(`Save error for ${filename}:`, error);
            // Fallback to localStorage
            return this.saveToLocalStorage(filename, data);
        }
    }

    async loadFile(filename) {
        if (this.demoMode) {
            return this.loadFromLocalStorage(filename);
        }

        try {
            // Search for the file
            const response = await gapi.client.drive.files.list({
                q: `name='${filename}' and parents in '${this.folderId}' and trashed=false`,
                spaces: 'drive'
            });

            if (response.result.files.length === 0) {
                console.log(`📄 ${filename} not found in Drive`);
                return null;
            }

            const fileId = response.result.files[0].id;
            
            // Download file content
            const fileResponse = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });

            const data = JSON.parse(fileResponse.body);
            console.log(`✅ Loaded ${filename} from Drive`);
            return data;
            
        } catch (error) {
            console.warn(`Load error for ${filename}:`, error);
            // Fallback to localStorage
            return this.loadFromLocalStorage(filename);
        }
    }

    saveToLocalStorage(filename, data) {
        try {
            localStorage.setItem(`lifestream_${filename}`, JSON.stringify(data));
            console.log(`💾 Saved ${filename} to localStorage`);
            return Promise.resolve({ id: 'local_' + filename });
        } catch (error) {
            console.warn(`localStorage save error for ${filename}:`, error);
            return Promise.reject(error);
        }
    }

    loadFromLocalStorage(filename) {
        try {
            const data = localStorage.getItem(`lifestream_${filename}`);
            if (data) {
                console.log(`💾 Loaded ${filename} from localStorage`);
                return Promise.resolve(JSON.parse(data));
            }
            return Promise.resolve(null);
        } catch (error) {
            console.warn(`localStorage load error for ${filename}:`, error);
            return Promise.resolve(null);
        }
    }

    // Convenience methods for app data
    async saveActivities(activities) {
        return this.saveFile('activities.json', activities);
    }

    async loadActivities() {
        return this.loadFile('activities.json');
    }

    async saveStats(stats) {
        return this.saveFile('stats.json', stats);
    }

    async loadStats() {
        return this.loadFile('stats.json');
    }

    async saveGoals(goals) {
        return this.saveFile('goals.json', goals);
    }

    async loadGoals() {
        return this.loadFile('goals.json');
    }

    getStorageStatus() {
        if (this.demoMode) {
            return '💾 Using local storage (demo mode)';
        }
        return this.isInitialized ? '📁 Connected to Google Drive' : '⚠️ Connecting...';
    }
}

// Initialize Drive Storage
const driveStorage = new DriveStorage();
console.log('📁 Drive storage module loaded');
