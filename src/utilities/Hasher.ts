import bcrypt from "bcrypt";

export class Hasher {
	public async hashPassword(password: string): Promise<string> {
		const saltRounds = 10;
		return await bcrypt.hash(password, saltRounds);
	}

	public async verifyPassword(
		password: string,
		hash: string
	): Promise<Boolean> {
		return await bcrypt.compare(password, hash);
	}

	public async hashTransactionPIN(pin: string): Promise<string> {
		const saltRounds = 11;
		return await bcrypt.hash(pin, saltRounds);
	}

	public async verifyTransactionPIN(
		pin: string,
		hash: string
	): Promise<Boolean> {
		return await bcrypt.compare(pin, hash);
	}
}
