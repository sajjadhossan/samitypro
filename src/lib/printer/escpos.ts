/**
 * ESC/POS Thermal Printer Driver & Web Bluetooth Connector
 * Supports standard 58mm (32 chars) and 80mm (48 chars) thermal POS printers.
 * Compatible with Xprinter, Zijiang, Sunmi, Rongta, Goojprt, Milestone, and standard BLE POS printers.
 */

export interface ReceiptData {
  samityName: string;
  samityAddress?: string;
  samityPhone?: string;
  receiptNo: string;
  date: string;
  time?: string;
  collectorName?: string;
  memberName: string;
  memberNo: string;
  items: Array<{ label: string; amount: number }>;
  totalAmount: number;
  paymentMethod: string;
  trxId?: string;
  balanceAfter?: number;
}

export class EscPosDriver {
  private buffer: number[] = [];

  constructor() {
    this.init();
  }

  // Initialize printer
  public init(): this {
    this.buffer.push(0x1B, 0x40); // ESC @
    return this;
  }

  // Text alignment
  public alignLeft(): this {
    this.buffer.push(0x1B, 0x61, 0x00); // ESC a 0
    return this;
  }

  public alignCenter(): this {
    this.buffer.push(0x1B, 0x61, 0x01); // ESC a 1
    return this;
  }

  public alignRight(): this {
    this.buffer.push(0x1B, 0x61, 0x02); // ESC a 2
    return this;
  }

  // Bold mode
  public bold(enable: boolean = true): this {
    this.buffer.push(0x1B, 0x45, enable ? 0x01 : 0x00); // ESC E
    return this;
  }

  // Text size
  public textSize(doubleWidth: boolean = false, doubleHeight: boolean = false): this {
    let size = 0x00;
    if (doubleWidth) size |= 0x20;
    if (doubleHeight) size |= 0x01;
    this.buffer.push(0x1D, 0x21, size); // GS !
    return this;
  }

  // Line feed
  public feed(lines: number = 1): this {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(0x0A);
    }
    return this;
  }

  // Append raw text string
  public text(str: string): this {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
    return this;
  }

  // Append text with new line
  public textLine(str: string = ''): this {
    this.text(str);
    this.buffer.push(0x0A);
    return this;
  }

  // Draw separator line (32 chars for 58mm)
  public separator(char: string = '-', width: number = 32): this {
    this.textLine(char.repeat(width));
    return this;
  }

  // Formatted two-column row (e.g. Left title, Right amount)
  public row(left: string, right: string, width: number = 32): this {
    const spaceCount = Math.max(1, width - left.length - right.length);
    this.textLine(left + ' '.repeat(spaceCount) + right);
    return this;
  }

  // Cut paper command
  public cut(): this {
    this.feed(3);
    this.buffer.push(0x1D, 0x56, 0x42, 0x00); // GS V 66 0
    return this;
  }

  // Get raw byte buffer
  public getBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  /**
   * Builds formatted Samity Receipt for 58mm/80mm POS Paper
   */
  public static buildReceipt(data: ReceiptData, is80mm: boolean = false): Uint8Array {
    const driver = new EscPosDriver();
    const width = is80mm ? 42 : 32;

    // Header
    driver.alignCenter()
      .textSize(true, true)
      .bold(true)
      .textLine(data.samityName)
      .textSize(false, false)
      .bold(false);

    if (data.samityAddress) {
      driver.textLine(data.samityAddress);
    }
    if (data.samityPhone) {
      driver.textLine(`Tel: ${data.samityPhone}`);
    }

    driver.separator('=', width);
    driver.bold(true).textLine('COLLECTION RECEIPT / POS').bold(false);
    driver.separator('=', width);

    // Meta Information
    driver.alignLeft();
    driver.row('Receipt No:', data.receiptNo, width);
    driver.row('Date:', `${data.date} ${data.time || ''}`.trim(), width);
    if (data.collectorName) {
      driver.row('Collector:', data.collectorName, width);
    }
    driver.separator('-', width);

    // Member Info
    driver.row('Member No:', data.memberNo, width);
    driver.row('Member Name:', data.memberName, width);
    driver.separator('-', width);

    // Collection Items
    driver.bold(true);
    for (const item of data.items) {
      driver.row(item.label, `BDT ${item.amount.toLocaleString('en-US')}`, width);
    }
    driver.bold(false);
    driver.separator('=', width);

    // Total Amount
    driver.alignCenter()
      .textSize(true, true)
      .bold(true)
      .textLine(`TOTAL: BDT ${data.totalAmount.toLocaleString('en-US')}`)
      .textSize(false, false)
      .bold(false);

    driver.alignLeft();
    driver.row('Method:', data.paymentMethod, width);
    if (data.trxId) {
      driver.row('Trx ID:', data.trxId, width);
    }
    if (data.balanceAfter !== undefined) {
      driver.row('Remaining Due:', `BDT ${data.balanceAfter.toLocaleString('en-US')}`, width);
    }

    driver.separator('-', width);

    // Footer
    driver.alignCenter()
      .textLine('Powered by SamityPro')
      .textLine('Digital Samity Management')
      .textLine('www.samitypro.com')
      .feed(2)
      .cut();

    return driver.getBytes();
  }

  /**
   * Connect and print directly to Bluetooth Thermal Printer via Web Bluetooth API
   */
  public static async printViaBluetooth(bytes: Uint8Array): Promise<{ success: boolean; message: string }> {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Bluetooth is only available in browser client.' };
    }

    const nav = window.navigator as unknown as { bluetooth?: { requestDevice: (opt: unknown) => Promise<unknown> } };

    if (!nav.bluetooth) {
      return { 
        success: false, 
        message: 'Web Bluetooth API is not supported in this browser. Please use Google Chrome or Android App.' 
      };
    }

    try {
      // Standard Bluetooth POS Printer Services
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Standard POS Printer Service
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
          '49535343-fe7d-4ae5-8fa9-9fafd205e455'
        ]
      }) as { gatt?: { connect: () => Promise<{ getPrimaryServices: () => Promise<Array<{ getCharacteristics: () => Promise<Array<{ writeValue: (b: Uint8Array) => Promise<void> }>> }>> }> } };

      if (!device || !device.gatt) {
        return { success: false, message: 'No Bluetooth device selected.' };
      }

      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();

      let targetCharacteristic: { writeValue: (b: Uint8Array) => Promise<void> } | null = null;

      for (const service of services) {
        try {
          const chars = await service.getCharacteristics();
          if (chars.length > 0) {
            targetCharacteristic = chars[0];
            break;
          }
        } catch {
          continue;
        }
      }

      if (!targetCharacteristic) {
        return { success: false, message: 'Could not find writable printer characteristic.' };
      }

      // Send bytes in chunks of 512 bytes for reliable BLE transmission
      const chunkSize = 512;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        await targetCharacteristic.writeValue(chunk);
      }

      return { success: true, message: 'Bluetooth POS রসিদ সফলভাবে প্রিন্ট হয়েছে!' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Bluetooth Connection Error: ${msg}` };
    }
  }
}
