import * as os from 'os';
import * as fs from 'fs';
import {spawn} from 'child_process';
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({host:'127.0.0.1', port: 8080 });
const homeDir = os.homedir();
const projectDir = homeDir + "/" + ".zero_ocr";
if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir);
}

const screenshotDir = projectDir + "/" + "screenshots";
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
} else {
    fs.rmSync(screenshotDir, { recursive: true });
    fs.mkdirSync(screenshotDir);
}

const ocrOutput = projectDir + "/" + "ocrOutput.txt";
if (!fs.existsSync(ocrOutput)) {
    fs.writeFileSync(ocrOutput, "");
} else {
    fs.rmSync(ocrOutput);
    fs.writeFileSync(ocrOutput, "");
}

const manga_ocr_process = spawn('manga_ocr', ['-r', screenshotDir, "--delay_secs=2"]);

wss.on('connection', function connection(ws) {
    manga_ocr_process.stderr.on('data', (data) => {
        ws.send(`${data}`.split(" s: ")[1]);
    });
    
});
