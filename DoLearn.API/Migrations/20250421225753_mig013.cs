using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoLearn.API.Migrations
{
    /// <inheritdoc />
    public partial class mig013 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_CourseSessions_CourseSessionId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_CourseSessionId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CourseSessionId",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "ReservedByUserID",
                table: "CourseSessions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReservedByUserID",
                table: "CourseSessions");

            migrationBuilder.AddColumn<int>(
                name: "CourseSessionId",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_CourseSessionId",
                table: "Users",
                column: "CourseSessionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_CourseSessions_CourseSessionId",
                table: "Users",
                column: "CourseSessionId",
                principalTable: "CourseSessions",
                principalColumn: "Id");
        }
    }
}
