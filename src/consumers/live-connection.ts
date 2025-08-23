import { Connector } from '@/core/connector';
import { QueueName } from '@/enums/environment';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor(QueueName.LiveConnection)
export class LiveConnectionConsumer extends WorkerHost {
  constructor(private readonly connector: Connector) {
    super();
  }

  async process(job: Job<string>) {
    this.connector.start(job.data);
  }
}
