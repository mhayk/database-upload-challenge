import path from 'path';
import fs from 'fs';
import { getRepository, getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import uploadConfig from '../config/upload';

interface Request {
  importFilename: string;
}

class ImportTransactionsService {
  async execute({ importFilename }: Request): Promise<Transaction[]> {
    const importFilePath = path.join(uploadConfig.directory, importFilename);
    const importFileExists = await fs.promises.stat(importFilePath);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    if (importFileExists) {
      // console.log(importFilePath);
      const buffer = fs.readFileSync(importFilePath, 'utf8');
      const lines = buffer.split('\n');
      const linesSize = lines.length - 1;
      lines.splice(linesSize, 1);
      lines.splice(0, 1);

      let transaction;
      for (const line of lines) {
        const [title, type, value, category] = line.split(', ');

        const categoryRepository = getRepository(Category);
        const categoryResult = await categoryRepository.findOne({
          where: {
            title: category,
          },
        });

        if (!categoryResult) {
          const newCategory = categoryRepository.create({
            title: category,
          });
          await categoryRepository.save(newCategory);

          transaction = transactionRepository.create({
            title,
            value: parseFloat(value),
            type,
            category_id: newCategory.id,
          });

          await transactionRepository.save(transaction);
        } else {
          transaction = transactionRepository.create({
            title,
            value: parseFloat(value),
            type,
            category_id: categoryResult.id,
          });

          await transactionRepository.save(transaction);
        }
      }
      const transactions = await transactionRepository.find();

      return transactions;
    }
    return [];
  }
}

export default ImportTransactionsService;
