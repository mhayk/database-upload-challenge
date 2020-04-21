import { EntityRepository, Repository } from 'typeorm';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    // console.log(transactions);
    const incomes = transactions.filter(
      transtion => transtion.type === 'income',
    );
    const outcome = transactions.filter(
      transtion => transtion.type === 'outcome',
    );
    const incomeTotal = incomes.reduce(
      (acc, item) => acc + Number(item.value),
      0,
    );
    const outcomeTotal = outcome.reduce(
      (acc, item) => acc + Number(item.value),
      0,
    );
    const total = incomeTotal - outcomeTotal;

    return {
      income: incomeTotal,
      outcome: outcomeTotal,
      total,
    };
  }
}

export default TransactionsRepository;
