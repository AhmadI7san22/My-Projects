
namespace RoomCharges_202220485
{
    partial class Form1
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.label1 = new System.Windows.Forms.Label();
            this.groupBox1 = new System.Windows.Forms.GroupBox();
            this.groupBox2 = new System.Windows.Forms.GroupBox();
            this.btnCalculate = new System.Windows.Forms.Button();
            this.btnClear = new System.Windows.Forms.Button();
            this.btnExit = new System.Windows.Forms.Button();
            this.lblDateToday = new System.Windows.Forms.Label();
            this.lblTimeToday = new System.Windows.Forms.Label();
            this.label4 = new System.Windows.Forms.Label();
            this.label5 = new System.Windows.Forms.Label();
            this.label6 = new System.Windows.Forms.Label();
            this.label7 = new System.Windows.Forms.Label();
            this.label8 = new System.Windows.Forms.Label();
            this.label9 = new System.Windows.Forms.Label();
            this.label10 = new System.Windows.Forms.Label();
            this.txtNights = new System.Windows.Forms.TextBox();
            this.txtNightlyCharge = new System.Windows.Forms.TextBox();
            this.txtRoomService = new System.Windows.Forms.TextBox();
            this.txtTelephone = new System.Windows.Forms.TextBox();
            this.txtMisc = new System.Windows.Forms.TextBox();
            this.label11 = new System.Windows.Forms.Label();
            this.label12 = new System.Windows.Forms.Label();
            this.label13 = new System.Windows.Forms.Label();
            this.label14 = new System.Windows.Forms.Label();
            this.label15 = new System.Windows.Forms.Label();
            this.groupBox3 = new System.Windows.Forms.GroupBox();
            this.lblRoomCharges = new System.Windows.Forms.Label();
            this.lblAddCharges = new System.Windows.Forms.Label();
            this.lblSubTotal = new System.Windows.Forms.Label();
            this.lblTax = new System.Windows.Forms.Label();
            this.lblTotal = new System.Windows.Forms.Label();
            this.groupBox1.SuspendLayout();
            this.groupBox2.SuspendLayout();
            this.groupBox3.SuspendLayout();
            this.SuspendLayout();
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Font = new System.Drawing.Font("Segoe UI", 12.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label1.Location = new System.Drawing.Point(200, 20);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(149, 23);
            this.label1.TabIndex = 0;
            this.label1.Text = "Highlander Hotel";
            // 
            // groupBox1
            // 
            this.groupBox1.Controls.Add(this.txtMisc);
            this.groupBox1.Controls.Add(this.txtTelephone);
            this.groupBox1.Controls.Add(this.txtRoomService);
            this.groupBox1.Controls.Add(this.label10);
            this.groupBox1.Controls.Add(this.label9);
            this.groupBox1.Controls.Add(this.label8);
            this.groupBox1.Location = new System.Drawing.Point(293, 102);
            this.groupBox1.Name = "groupBox1";
            this.groupBox1.Size = new System.Drawing.Size(200, 126);
            this.groupBox1.TabIndex = 1;
            this.groupBox1.TabStop = false;
            this.groupBox1.Text = "Additional Charges";
            this.groupBox1.Enter += new System.EventHandler(this.groupBox1_Enter);
            // 
            // groupBox2
            // 
            this.groupBox2.Controls.Add(this.txtNightlyCharge);
            this.groupBox2.Controls.Add(this.txtNights);
            this.groupBox2.Controls.Add(this.label7);
            this.groupBox2.Controls.Add(this.label6);
            this.groupBox2.Location = new System.Drawing.Point(37, 93);
            this.groupBox2.Name = "groupBox2";
            this.groupBox2.Size = new System.Drawing.Size(218, 135);
            this.groupBox2.TabIndex = 2;
            this.groupBox2.TabStop = false;
            this.groupBox2.Text = "Room Infrmation";
            // 
            // btnCalculate
            // 
            this.btnCalculate.Location = new System.Drawing.Point(150, 478);
            this.btnCalculate.Name = "btnCalculate";
            this.btnCalculate.Size = new System.Drawing.Size(75, 39);
            this.btnCalculate.TabIndex = 4;
            this.btnCalculate.Text = "C&alculate Changes";
            this.btnCalculate.UseVisualStyleBackColor = true;
            // 
            // btnClear
            // 
            this.btnClear.Location = new System.Drawing.Point(231, 478);
            this.btnClear.Name = "btnClear";
            this.btnClear.Size = new System.Drawing.Size(75, 39);
            this.btnClear.TabIndex = 5;
            this.btnClear.Text = "Clea&r";
            this.btnClear.UseVisualStyleBackColor = true;
            // 
            // btnExit
            // 
            this.btnExit.Location = new System.Drawing.Point(312, 478);
            this.btnExit.Name = "btnExit";
            this.btnExit.Size = new System.Drawing.Size(75, 39);
            this.btnExit.TabIndex = 6;
            this.btnExit.Text = "E&xit";
            this.btnExit.UseVisualStyleBackColor = true;
            // 
            // lblDateToday
            // 
            this.lblDateToday.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.lblDateToday.Location = new System.Drawing.Point(453, 48);
            this.lblDateToday.Name = "lblDateToday";
            this.lblDateToday.Size = new System.Drawing.Size(78, 22);
            this.lblDateToday.TabIndex = 7;
            // 
            // lblTimeToday
            // 
            this.lblTimeToday.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.lblTimeToday.Location = new System.Drawing.Point(453, 75);
            this.lblTimeToday.Name = "lblTimeToday";
            this.lblTimeToday.Size = new System.Drawing.Size(78, 24);
            this.lblTimeToday.TabIndex = 8;
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(367, 49);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(80, 15);
            this.label4.TabIndex = 9;
            this.label4.Text = "Today\'s Date:";
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Location = new System.Drawing.Point(392, 75);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(38, 15);
            this.label5.TabIndex = 10;
            this.label5.Text = "Time:";
            this.label5.Click += new System.EventHandler(this.label5_Click);
            // 
            // label6
            // 
            this.label6.AutoSize = true;
            this.label6.Location = new System.Drawing.Point(31, 47);
            this.label6.Name = "label6";
            this.label6.Size = new System.Drawing.Size(46, 15);
            this.label6.TabIndex = 0;
            this.label6.Text = "Nights:";
            // 
            // label7
            // 
            this.label7.AutoSize = true;
            this.label7.Location = new System.Drawing.Point(-3, 89);
            this.label7.Name = "label7";
            this.label7.Size = new System.Drawing.Size(98, 15);
            this.label7.TabIndex = 1;
            this.label7.Text = "Nightly changes:";
            // 
            // label8
            // 
            this.label8.AutoSize = true;
            this.label8.Location = new System.Drawing.Point(2, 30);
            this.label8.Name = "label8";
            this.label8.Size = new System.Drawing.Size(86, 15);
            this.label8.TabIndex = 0;
            this.label8.Text = "Room service:";
            // 
            // label9
            // 
            this.label9.AutoSize = true;
            this.label9.Location = new System.Drawing.Point(16, 59);
            this.label9.Name = "label9";
            this.label9.Size = new System.Drawing.Size(68, 15);
            this.label9.TabIndex = 1;
            this.label9.Text = "Telephone:";
            // 
            // label10
            // 
            this.label10.AutoSize = true;
            this.label10.Location = new System.Drawing.Point(37, 89);
            this.label10.Name = "label10";
            this.label10.Size = new System.Drawing.Size(35, 15);
            this.label10.TabIndex = 2;
            this.label10.Text = "Misc:";
            // 
            // txtNights
            // 
            this.txtNights.Location = new System.Drawing.Point(95, 47);
            this.txtNights.Name = "txtNights";
            this.txtNights.Size = new System.Drawing.Size(100, 23);
            this.txtNights.TabIndex = 2;
            // 
            // txtNightlyCharge
            // 
            this.txtNightlyCharge.Location = new System.Drawing.Point(95, 86);
            this.txtNightlyCharge.Name = "txtNightlyCharge";
            this.txtNightlyCharge.Size = new System.Drawing.Size(100, 23);
            this.txtNightlyCharge.TabIndex = 3;
            // 
            // txtRoomService
            // 
            this.txtRoomService.Location = new System.Drawing.Point(94, 27);
            this.txtRoomService.Name = "txtRoomService";
            this.txtRoomService.Size = new System.Drawing.Size(100, 23);
            this.txtRoomService.TabIndex = 3;
            // 
            // txtTelephone
            // 
            this.txtTelephone.Location = new System.Drawing.Point(94, 56);
            this.txtTelephone.Name = "txtTelephone";
            this.txtTelephone.Size = new System.Drawing.Size(100, 23);
            this.txtTelephone.TabIndex = 4;
            // 
            // txtMisc
            // 
            this.txtMisc.Location = new System.Drawing.Point(94, 86);
            this.txtMisc.Name = "txtMisc";
            this.txtMisc.Size = new System.Drawing.Size(100, 23);
            this.txtMisc.TabIndex = 5;
            // 
            // label11
            // 
            this.label11.AutoSize = true;
            this.label11.Location = new System.Drawing.Point(74, 42);
            this.label11.Name = "label11";
            this.label11.Size = new System.Drawing.Size(89, 15);
            this.label11.TabIndex = 0;
            this.label11.Text = "Room charges:";
            this.label11.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            this.label11.Click += new System.EventHandler(this.label11_Click);
            // 
            // label12
            // 
            this.label12.AutoSize = true;
            this.label12.Location = new System.Drawing.Point(63, 76);
            this.label12.Name = "label12";
            this.label12.Size = new System.Drawing.Size(114, 15);
            this.label12.TabIndex = 1;
            this.label12.Text = "Additional changes:";
            this.label12.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // label13
            // 
            this.label13.AutoSize = true;
            this.label13.Location = new System.Drawing.Point(88, 107);
            this.label13.Name = "label13";
            this.label13.Size = new System.Drawing.Size(58, 15);
            this.label13.TabIndex = 2;
            this.label13.Text = "SubTotal:";
            // 
            // label14
            // 
            this.label14.AutoSize = true;
            this.label14.Location = new System.Drawing.Point(104, 146);
            this.label14.Name = "label14";
            this.label14.Size = new System.Drawing.Size(29, 15);
            this.label14.TabIndex = 3;
            this.label14.Text = "Tax:";
            // 
            // label15
            // 
            this.label15.AutoSize = true;
            this.label15.Location = new System.Drawing.Point(74, 176);
            this.label15.Name = "label15";
            this.label15.Size = new System.Drawing.Size(83, 15);
            this.label15.TabIndex = 4;
            this.label15.Text = "Total charges:";
            // 
            // groupBox3
            // 
            this.groupBox3.Controls.Add(this.lblTotal);
            this.groupBox3.Controls.Add(this.lblTax);
            this.groupBox3.Controls.Add(this.lblSubTotal);
            this.groupBox3.Controls.Add(this.lblAddCharges);
            this.groupBox3.Controls.Add(this.lblRoomCharges);
            this.groupBox3.Controls.Add(this.label15);
            this.groupBox3.Controls.Add(this.label14);
            this.groupBox3.Controls.Add(this.label13);
            this.groupBox3.Controls.Add(this.label12);
            this.groupBox3.Controls.Add(this.label11);
            this.groupBox3.Location = new System.Drawing.Point(55, 243);
            this.groupBox3.Name = "groupBox3";
            this.groupBox3.Size = new System.Drawing.Size(438, 216);
            this.groupBox3.TabIndex = 3;
            this.groupBox3.TabStop = false;
            this.groupBox3.Text = "Total Charges";
            // 
            // lblRoomCharges
            // 
            this.lblRoomCharges.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.lblRoomCharges.Location = new System.Drawing.Point(180, 41);
            this.lblRoomCharges.Name = "lblRoomCharges";
            this.lblRoomCharges.Size = new System.Drawing.Size(78, 22);
            this.lblRoomCharges.TabIndex = 8;
            // 
            // lblAddCharges
            // 
            this.lblAddCharges.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.lblAddCharges.Location = new System.Drawing.Point(180, 75);
            this.lblAddCharges.Name = "lblAddCharges";
            this.lblAddCharges.Size = new System.Drawing.Size(78, 22);
            this.lblAddCharges.TabIndex = 9;
            // 
            // lblSubTotal
            // 
            this.lblSubTotal.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.lblSubTotal.Location = new System.Drawing.Point(180, 106);
            this.lblSubTotal.Name = "lblSubTotal";
            this.lblSubTotal.Size = new System.Drawing.Size(78, 22);
            this.lblSubTotal.TabIndex = 10;
            // 
            // lblTax
            // 
            this.lblTax.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.lblTax.Location = new System.Drawing.Point(180, 145);
            this.lblTax.Name = "lblTax";
            this.lblTax.Size = new System.Drawing.Size(78, 22);
            this.lblTax.TabIndex = 11;
            // 
            // lblTotal
            // 
            this.lblTotal.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.lblTotal.Location = new System.Drawing.Point(180, 176);
            this.lblTotal.Name = "lblTotal";
            this.lblTotal.Size = new System.Drawing.Size(78, 22);
            this.lblTotal.TabIndex = 12;
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(543, 539);
            this.Controls.Add(this.label5);
            this.Controls.Add(this.label4);
            this.Controls.Add(this.lblTimeToday);
            this.Controls.Add(this.lblDateToday);
            this.Controls.Add(this.btnExit);
            this.Controls.Add(this.btnClear);
            this.Controls.Add(this.btnCalculate);
            this.Controls.Add(this.groupBox3);
            this.Controls.Add(this.groupBox2);
            this.Controls.Add(this.groupBox1);
            this.Controls.Add(this.label1);
            this.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.Name = "Form1";
            this.Text = "Room Charge Calculator";
            this.Load += new System.EventHandler(this.Form1_Load);
            this.groupBox1.ResumeLayout(false);
            this.groupBox1.PerformLayout();
            this.groupBox2.ResumeLayout(false);
            this.groupBox2.PerformLayout();
            this.groupBox3.ResumeLayout(false);
            this.groupBox3.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.GroupBox groupBox1;
        private System.Windows.Forms.Label label10;
        private System.Windows.Forms.Label label9;
        private System.Windows.Forms.Label label8;
        private System.Windows.Forms.GroupBox groupBox2;
        private System.Windows.Forms.Label label7;
        private System.Windows.Forms.Label label6;
        private System.Windows.Forms.Button btnCalculate;
        private System.Windows.Forms.Button btnClear;
        private System.Windows.Forms.Button btnExit;
        private System.Windows.Forms.Label lblDateToday;
        private System.Windows.Forms.Label lblTimeToday;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.TextBox txtMisc;
        private System.Windows.Forms.TextBox txtTelephone;
        private System.Windows.Forms.TextBox txtRoomService;
        private System.Windows.Forms.TextBox txtNightlyCharge;
        private System.Windows.Forms.TextBox txtNights;
        private System.Windows.Forms.Label label11;
        private System.Windows.Forms.Label label12;
        private System.Windows.Forms.Label label13;
        private System.Windows.Forms.Label label14;
        private System.Windows.Forms.Label label15;
        private System.Windows.Forms.GroupBox groupBox3;
        private System.Windows.Forms.Label lblAddCharges;
        private System.Windows.Forms.Label lblRoomCharges;
        private System.Windows.Forms.Label lblTotal;
        private System.Windows.Forms.Label lblTax;
        private System.Windows.Forms.Label lblSubTotal;
    }
}

