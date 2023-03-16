import voucherService from "services/voucherService";
import voucherRepository from "repositories/voucherRepository";
import voucherFactory from "../factories/voucherFactory";

describe("Create voucher", () => {
	it("Should create a voucher", async () => {
		const voucher = voucherFactory.createVoucher();
		const DISCOUNT = 10;

		jest.spyOn(
			voucherRepository,
			"getVoucherByCode"
		).mockImplementationOnce((): any => {
			return undefined;
		});

		const result = jest
			.spyOn(voucherRepository, "createVoucher")
			.mockImplementationOnce((): any => {});

		await voucherService.createVoucher(voucher, DISCOUNT);

		expect(result).toBeCalled();
	});

	it("Should not create a voucher", async () => {
		const voucher = voucherFactory.createVoucher();
		const DISCOUNT = 10;

		jest.spyOn(
			voucherRepository,
			"getVoucherByCode"
		).mockImplementationOnce((): any => {
			return voucher;
		});

		const error = voucherService.createVoucher(voucher, DISCOUNT);

		expect(error).rejects.toEqual({
			type: "conflict",
			message: "Voucher already exist.",
		});
	});
});
