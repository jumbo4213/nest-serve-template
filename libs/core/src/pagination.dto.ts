import { ApiProperty } from '@nestjs/swagger';
export class Pagination {
  @ApiProperty({ description: '当前页码' })
  page: number;
  @ApiProperty({ description: '每页条数' })
  size: number;
  @ApiProperty({ description: '总条目数' })
  total: number;
  @ApiProperty({ description: '总页数' })
  count: number;
  constructor(page = 1, limit = 30, total = 0) {
    this.page = page;
    this.size = limit;
    this.total = total;
    this.count = Math.ceil(total / limit);
  }
}
