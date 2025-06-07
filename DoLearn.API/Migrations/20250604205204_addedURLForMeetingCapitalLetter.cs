using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoLearn.API.Migrations
{
    /// <inheritdoc />
    public partial class addedURLForMeetingCapitalLetter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "meetingURL",
                table: "CourseSessions",
                newName: "MeetingURL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "MeetingURL",
                table: "CourseSessions",
                newName: "meetingURL");
        }
    }
}
