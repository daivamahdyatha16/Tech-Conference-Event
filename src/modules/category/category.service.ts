import { CategoryRepository } from './category.repository';

export class CategoryService {
    private categoryRepository = new CategoryRepository();

    async findAll() {
        return this.categoryRepository.findAll();
    }
}