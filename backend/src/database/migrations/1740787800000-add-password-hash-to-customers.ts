import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPasswordHashToCustomers1740787800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('customers');
    const hasPasswordHash = table?.findColumnByName('passwordHash');

    if (!hasPasswordHash) {
      await queryRunner.addColumn(
        'customers',
        new TableColumn({
          name: 'passwordHash',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('customers');
    const hasPasswordHash = table?.findColumnByName('passwordHash');

    if (hasPasswordHash) {
      await queryRunner.dropColumn('customers', 'passwordHash');
    }
  }
}
