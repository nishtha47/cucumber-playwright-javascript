class BillPayPage {
    constructor(page) {
        this.page = page;
    }

    // Navigate to Bill Pay page
    async navigateToBillPay() {
        await this.page.click('a[href*="billpay.htm"]');
    }

    // Fill payee information
    async fillPayeeInformation(payeeData) {
        await this.page.fill('input[name="payee.name"]', payeeData['Payee Name']);
        await this.page.fill('input[name="payee.address.street"]', payeeData['Address']);
        await this.page.fill('input[name="payee.address.city"]', payeeData['City']);
        await this.page.fill('input[name="payee.address.state"]', payeeData['State']);
        await this.page.fill('input[name="payee.address.zipCode"]', payeeData['Zip Code']);
        await this.page.fill('input[name="payee.phoneNumber"]', payeeData['Phone']);
        await this.page.fill('input[name="payee.accountNumber"]', payeeData['Account Number']);
        await this.page.fill('input[name="verifyAccount"]', payeeData['Verify Account']);
    }

    // Enter payment amount
    async enterPaymentAmount(amount) {
        await this.page.fill('#amount', amount);
    }

    // Click Send Payment
    async sendPayment() {
        await this.page.click('input[value="Send Payment"]');
    }

    // Get confirmation text after payment
    async getPaymentConfirmation() {
        const text = await this.page.textContent('.title, .success');
        return text.trim();
    }
}

module.exports = BillPayPage;
