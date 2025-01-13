import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { ilike, asc, desc, eq } from "drizzle-orm";
import { products } from "../db/schema/products";
import { store_products } from "../db/schema/store_products";


export async function search_product(db: NodePgDatabase, name: string, sort_by: 'name' | 'price' | 'amount', sort_direction: 'ASC' | 'DESC') {
    const sort = sort_direction == 'ASC' ? asc : desc
    let column

    switch (sort_by) {
        case 'name':
            column = products.name
            break;
        case 'amount':
            column = products.amount
            break;
        default:
            column = store_products.price
            break;
    }

    const search_results = await db
        .select()
        .from(products)
        .where(ilike(products.name, `%${name}%`))
        .innerJoin(store_products, eq(products.id, store_products.productID))
        .orderBy(sort(column))

    return search_results
}
