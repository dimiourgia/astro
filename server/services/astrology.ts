import { spawn } from 'child_process';
import path from 'path';

export interface BirthChartData {
  houses: { [key: string]: any };
  planets: { [key: string]: any };
  aspects: { [key: string]: any };
  chartData: any;
}

export async function generateBirthChart(
  dateOfBirth: string,
  birthTime: string,
  birthLocation: string,
  unknownBirthTime: boolean = false
): Promise<BirthChartData> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'astrology_service.py');
    
    // Use default time if unknown
    const time = unknownBirthTime ? '11:00' : birthTime;
    
    const args = [pythonScript, dateOfBirth, time, birthLocation];
    const pythonProcess = spawn('lython', args);
    
    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${errorString}`));
        return;
      }

      try {
        const result = JSON.parse(dataString);
        resolve(result);
      } catch (parseError) {
        reject(new Error(`Failed to parse chart data: ${parseError}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
}
