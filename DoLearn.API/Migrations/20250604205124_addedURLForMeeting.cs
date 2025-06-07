using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoLearn.API.Migrations
{
    /// <inheritdoc />
    public partial class addedURLForMeeting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "meetingURL",
                table: "CourseSessions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "meetingURL",
                table: "CourseSessions");
        }
    }
}
