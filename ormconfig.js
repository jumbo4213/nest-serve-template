/*
 * @Description:
 * @Author: jumbo
 * @Date: 2021-07-09 15:47:53
 * @LastEditors: jumbo
 * @LastEditTime: 2021-11-03 12:05:51
 */
const ormConfig = {
  development: {
    synchronize: true,
    dropSchema: false,
  },
  test: {
    //type: 'sqlite',
    //database: ':memory:',
    synchronize: true,
    logging: false,
    dropSchema: false,
  },
};
module.exports = {
  type: 'postgres',
  url: process.env.DB_URL,
  entities: ['libs/shared/src/entities/*.entity.ts'],
  synchronize: true,
};
