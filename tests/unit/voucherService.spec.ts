import voucherService from "services/voucherService";
import voucherRepository from "repositories/voucherRepository";
import voucherFactory from "../factories/voucherFactory";

describe("Create voucher", () => {
	it("Should create a voucher", async () => {
		const voucher = voucherFactory.createVoucher();

		jest.spyOn(
			voucherRepository,
			"getVoucherByCode"
		).mockImplementationOnce((): any => {
			return undefined;
		});

		const result = jest
			.spyOn(voucherRepository, "createVoucher")
			.mockImplementationOnce((): any => {});

		await voucherService.createVoucher(voucher.code, voucher.discount);

		expect(result).toBeCalled();
	});

	it("Should not create a voucher", async () => {
		const voucher = voucherFactory.createVoucher();

		jest.spyOn(
			voucherRepository,
			"getVoucherByCode"
		).mockImplementationOnce((): any => {
			return voucher;
		});

		const error = voucherService.createVoucher(
			voucher.code,
			voucher.discount
		);

		expect(error).rejects.toEqual({
			type: "conflict",
			message: "Voucher already exist.",
		});
	});
});

describe("Apply voucher", () => {
	it("Should apply a voucher", async () => {
		const voucher = voucherFactory.createVoucher();
		const VALUE = 110;

		const isVoucherValid = jest
			.spyOn(voucherRepository, "getVoucherByCode")
			.mockImplementationOnce((): any => {
				return voucher;
			});

		const changeVoucherStatus = jest
			.spyOn(voucherRepository, "useVoucher")
			.mockImplementationOnce((): any => {});

		const result = await voucherService.applyVoucher(voucher.code, VALUE);

		expect(isVoucherValid).toBeCalled();
		expect(changeVoucherStatus).toBeCalled();
		expect(result).toEqual({
			amount: VALUE,
			discount: voucher.discount,
			finalAmount: VALUE - VALUE * (voucher.discount / 100),
			applied: true,
		});
	});

	it("Should not apply with a non-existent voucher", () => {
		const voucher = voucherFactory.createVoucher();
		const VALUE = 110;

		jest.spyOn(
			voucherRepository,
			"getVoucherByCode"
		).mockImplementationOnce((): any => {
			return undefined;
		});

		const error = voucherService.applyVoucher(voucher.code, VALUE);

		expect(error).rejects.toEqual({
			type: "conflict",
			message: "Voucher does not exist.",
		});
	});

	it("Should not apply a used voucher", async () => {
		const voucher = voucherFactory.createVoucher();
		voucher.used = true;
		const VALUE = 110;

		const isVoucherValid = jest
			.spyOn(voucherRepository, "getVoucherByCode")
			.mockImplementationOnce((): any => {
				return voucher;
			});

		const result = await voucherService.applyVoucher(voucher.code, VALUE);

		expect(isVoucherValid).toBeCalled();
		expect(result).toEqual({
			amount: VALUE,
			discount: voucher.discount,
			finalAmount: VALUE,
			applied: false,
		});
	});

	it("Should not apply with value less than 100", async () => {
		const voucher = voucherFactory.createVoucher();
		const VALUE = 90;

		const isVoucherValid = jest
			.spyOn(voucherRepository, "getVoucherByCode")
			.mockImplementationOnce((): any => {
				return voucher;
			});

		const result = await voucherService.applyVoucher(voucher.code, VALUE);

		expect(isVoucherValid).toBeCalled();
		expect(result).toEqual({
			amount: VALUE,
			discount: voucher.discount,
			finalAmount: VALUE,
			applied: false,
		});
	});
});
