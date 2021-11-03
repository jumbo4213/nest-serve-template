import {
  UsePipes,
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { <%= classify(name) %>Service } from './<%= name %>.service';
import { ApiOperation } from '@nestjs/swagger';
import { CurrentOperator } from '../operators';
import {
  New<%= classify(singular(name)) %>,
  One<%= classify(singular(name)) %>,
  Many<%= classify(singular(name)) %>,
  <%= classify(singular(name)) %>Query,
  <%= classify(singular(name)) %>Options,
} from './<%= name %>.dto';
import { CurrentUser } from '@app/shared/auth';

@Controller('<%= dasherize(name) %>')
export class <%= classify(name) %>Controller {
  constructor(public service: <%= classify(name) %>Service) {}

  @Get()
  @ApiOperation({ summary: '' })
  async index(
    @CurrentUser() currentOperator: CurrentOperator,
    @Query() query: <%= classify(singular(name)) %>Query,
  ): Promise<Many<%= classify(singular(name)) %>> {
    const [<%= camelize(name) %>, pagination] = await this.service.paginate({ limit: 30, page: query.page });
    return new Many<%= classify(singular(name)) %>(<%= camelize(name) %>, pagination);
  }
/*
  @Get('options')
  @ApiOperation({ summary: '' })
  async options(
    @CurrentUser() currentOperator: CurrentOperator,
  ): Promise<<%= classify(singular(name)) %>Options> {
    const options = await this.service.options(currentOperator);
    return options;
  }
*/
  @Post()
  @ApiOperation({ summary: '' })
  async create(
    @CurrentUser() currentOperator: CurrentOperator,
    @Body() new<%= classify(singular(name)) %>: New<%= classify(singular(name)) %>,
  ): Promise<any> {
    const <%= camelize(singular(name)) %> = this.service.create(new<%= classify(singular(name)) %>);
    await this.service.saveByOperator(currentOperator, <%= camelize(singular(name)) %>);
  }

  @Get(':id')
  @ApiOperation({ summary: '' })
  async detail(
    @CurrentUser() currentOperator: CurrentOperator,
    @Param('id') id: string,
  ): Promise<One<%= classify(singular(name)) %>> {
    const <%= camelize(singular(name)) %> = await this.service.getOne(id);
    return new One<%= classify(singular(name)) %>(<%= camelize(singular(name)) %>);
  }

  @Put(':id')
  @ApiOperation({ summary: '' })
  async update(
    @CurrentUser() currentOperator: CurrentOperator,
    @Param('id') id: string,
    @Body() new<%= classify(singular(name)) %>: New<%= classify(singular(name)) %>,
  ): Promise<any> {
    const <%= camelize(singular(name)) %> = await this.service.getOne(id);
    Object.assign(<%= camelize(singular(name)) %>, this.service.create(new<%= classify(singular(name)) %>));
    await this.service.saveByOperator(currentOperator, <%= camelize(singular(name)) %>);
  }
/**
  @Delete(':id')
  @ApiOperation({ summary: '' })
  async delete(
    @CurrentUser() currentOperator: CurrentOperator,
    @Param('id') id: string,
  ): Promise<any> {
    const <%= camelize(singular(name)) %> = await this.service.getOne(id);
    await this.service.softRemove(<%= camelize(singular(name)) %>);
  }
*/
}
