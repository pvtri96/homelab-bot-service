import { Injectable } from '@nestjs/common';
import * as Fs from 'node:fs';
import * as Path from 'node:path';
import * as process from 'process';
import * as TextToImage from 'text-to-image';

@Injectable()
export class FormatterService {
  public formatByte(x, withUnit = true) {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    let l = 0,
      n = parseInt(x, 10) || 0;

    while (n >= 1024 && ++l) {
      n = n / 1024;
    }

    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + (withUnit ? ' ' + units[l] : '');
  }

  public formatPercentage(a, b) {
    return Math.round((a / b) * 10000) / 100 + '%';
  }

  public toImage(text: string) {
    const uri = TextToImage.generateSync(text.replace(/ /g, '\xA0'), {
      bgColor: 'black',
      textColor: 'white',
      fontFamily: 'Fira Code, Consolas',
      fontPath: Path.join(process.cwd(), 'resources', 'fonts', 'FiraCode.ttf'),
    });
    const base64Image = uri.split(';base64,').pop();

    const path = Path.join(process.cwd(), 'dist', 'temp.png');
    Fs.writeFileSync(path, base64Image, { encoding: 'base64' });
    return Fs.createReadStream(path);
  }
}
